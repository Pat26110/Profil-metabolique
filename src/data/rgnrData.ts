import questionsData from '../../data/rgnr_questions_v1.json';
import profilesData from '../../data/rgnr_profiles_v1.json';
import calibrationData from '../../data/rgnr_calibration_cases_v1.json';
import type { CalibrationCase, ProfileConfig, QuestionConfig } from '../types/rgnr';

export const questions = questionsData as QuestionConfig[];
export const profiles = profilesData as ProfileConfig[];
export const calibrationCases = calibrationData as CalibrationCase[];
