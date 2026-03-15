import queryString from 'query-string';
import { Role } from '@taiger-common/core';

/** Query string for users with Agent or Editor role (non-archived). Use with getUsers() for essay writers / interview trainers. */
export const ESSAY_WRITERS_QUERY_STRING = queryString.stringify({
    role: [Role.Agent, Role.Editor],
    archiv: false
});
