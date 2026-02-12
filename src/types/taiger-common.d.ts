/**
 * Type extensions for @taiger-common packages
 * Extends Mongoose-based types for frontend use (string IDs instead of ObjectId)
 */

import type {
    IApplication,
    ICourse,
    IProgram,
    IStudent,
} from '@taiger-common/model';

// Frontend-friendly Application type with string _id
export interface IApplicationWithId extends IApplication {
    _id: string;
}

// Frontend-friendly Program type with string _id
export interface IProgramWithId extends Omit<IProgram, 'vcId'> {
    _id: string;
    vcId?: string;
}

// Frontend-friendly User type with string _id
export interface IUserWithId
    extends Omit<IStudent, 'agents' | 'editors' | 'profile'> {
    _id: string;
    courses?: ICourse;
}

// Student response with populated references (from API)
export interface IStudentResponse extends IStudent {
    archiv?: boolean;
    applying_program_count: number;
    applications?: IApplicationWithId[];
    agents?: IUserWithId[];
    editors?: IUserWithId[];
    generaldocs_threads?: IUserGeneraldocsThread[];
}

// Re-export core interfaces for convenience
export type { IApplication, IProgram, IUser } from '@taiger-common/model';
