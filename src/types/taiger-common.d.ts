/**
 * Type extensions for @taiger-common packages
 * Extends Mongoose-based types for frontend use (string IDs instead of ObjectId)
 */

import type {
    IApplication,
    ICourse,
    IProgram,
    IStudent,
    IUserProfileItem
} from '@taiger-common/model';

// Re-export UserProps from @taiger-common/core (it exists but isn't exported)
declare module '@taiger-common/core' {
    export interface UserProps {
        role: string;
        archiv?: boolean;
        _id?: string;
        email?: string;
        firstname?: string;
        lastname?: string;
        [key: string]: unknown;
    }
}

// Frontend-friendly Application type with string _id
export interface IApplicationWithId
    extends Omit<IApplication, 'programId' | 'studentId'> {
    _id: string;
    programId?: string | IApplicationProgramId;
    studentId?: string;
}

// Program reference as nested in Application (populated)
export interface IApplicationProgramId extends Omit<IProgram, 'vcId'> {
    _id: string;
    school: string;
    program_name: string;
    degree?: string;
    semester?: string;
    lang?: string;
    uni_assist?: string | string[];
    allowOnlyGraduatedApplicant?: boolean;
    [key: string]: unknown;
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
    profile?: IUserProfileItem[];
    courses?: ICourse;
    agents?: string[];
    editors?: string[];
}

// Student response with populated references (from API)
export interface IStudentResponse extends IUserWithId {
    applications?: IApplicationWithId[];
    agents?: IUserWithId[];
    editors?: IUserWithId[];
}

// Re-export core interfaces for convenience
export type { IApplication, IProgram, IUser } from '@taiger-common/model';
