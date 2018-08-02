import { AthleteModel } from "../models/athlete.model";
import { PeriodicAthleteSettingsModel } from "../models/athlete-settings/periodic-athlete-settings.model";
import { UserSettingsModel } from "../models/user-settings/user-settings.model";
import * as _ from "lodash";

/**
 * Shared by core and app to resolve AthleteModel for a given activity date
 */
export class AthleteModelResolver {

	public userSettingsModel: UserSettingsModel;

	public periodicAthleteSettingsModels: PeriodicAthleteSettingsModel[];

	constructor(userSettingsModel: UserSettingsModel, periodicAthleteSettingsModels: PeriodicAthleteSettingsModel[]) {
		this.userSettingsModel = userSettingsModel;
		this.periodicAthleteSettingsModels = periodicAthleteSettingsModels;
	}

	/**
	 * Resolve the proper AthleteModel along UserSettingsModel.hasPeriodicAthleteSettings and activity date
	 * @param onDateString Date format YYYY-MM-DD
	 * @returns {AthleteModel}
	 */
	public resolve(onDateString: string): AthleteModel {

		this.assertCompliantDate(onDateString);

		let athleteModel: AthleteModel;

		// Use gender set in synced user settings
		const gender = this.userSettingsModel.athleteModel.gender;

		const hasPeriodicAthleteSettings: boolean = this.userSettingsModel.hasPeriodicAthleteSettings;

		if (hasPeriodicAthleteSettings) {

			// Find the local AthleteModel for the given date
			const periodicAthleteSettingsModel: PeriodicAthleteSettingsModel = this.resolvePeriodicAthleteSettingsAtDate(onDateString);
			athleteModel = new AthleteModel(gender, periodicAthleteSettingsModel.toAthleteSettingsModel());

		} else {
			athleteModel = this.userSettingsModel.athleteModel; // Use default synced AthleteModel
		}

		return athleteModel;
	}

	public resolvePeriodicAthleteSettingsAtDate(onDate: string): PeriodicAthleteSettingsModel {

		const onDateTime: number = new Date(onDate).getTime();

		const periodicAthleteSettingsModel: PeriodicAthleteSettingsModel = _.find(this.periodicAthleteSettingsModels, (periodicAthleteSettings: PeriodicAthleteSettingsModel) => {
			return onDateTime >= new Date(periodicAthleteSettings.from).getTime();
		});

		return (periodicAthleteSettingsModel) ? periodicAthleteSettingsModel : null;
	}


	private assertCompliantDate(onDateString: string): void {

		const isDateWellFormatted = (/([0-9]{4})\-([0-9]{2})\-([0-9]{2})/gm).exec(onDateString);
		const onDate = new Date(onDateString);
		const isValidDate = (onDate instanceof Date && !isNaN(onDate.getTime()));

		if (!isDateWellFormatted || !isValidDate) {
			throw new Error("Invalid date or not formatted as 'YYYY-MM-DD'");
		}
	}
}