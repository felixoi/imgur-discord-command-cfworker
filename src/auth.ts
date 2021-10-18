/*
 * This class contains modified code from https://developers.cloudflare.com/workers/examples/basic-auth
 * Copyright (c) 2021 Cloudflare, Inc.
 * License: https://github.com/cloudflare/cloudflare-docs/blob/8be04aec617170d777ef7d0e3e001f5d6eb1e60f/LICENSE
 */

/**
 * Throws exception on authentication failure.
 *
 * @param {string} user user provided in the authentication header
 * @param {string} pass password provided in the authentication header
 * @throws {UnauthorizedException} if the username or password do not match
 */
export function verifyCredentials(user: string, pass: string): void | HTTPException {
    if (HTTP_BASIC_USER !== user) {
        throw UnauthorizedException('Invalid username.')
    }

    if (HTTP_BASIC_PASSWORD !== pass) {
        throw UnauthorizedException('Invalid password.')
    }
}

/**
 * Type for authentication data.
 */
export interface AuthData {
    user: string,
    pass: string
}

/**
 * Parse HTTP Basic Authorization value.
 *
 * @param {Request} request the incoming http request
 * @throws BadRequestException if there is no or an invalid authentication header
 * @returns {{ user: string, pass: string }} Username and password provided in the authentication header
 */
export function basicAuthentication(request: Request): AuthData {
    const Authorization = request.headers.get('Authorization')

    if(!Authorization) {
        throw BadRequestException('No authorization header.')
    }

    const [scheme, encoded] = Authorization.split(' ')

    // The Authorization header must start with "Basic", followed by a space.
    if (!encoded || scheme !== 'Basic') {
        throw BadRequestException('Malformed authorization header.')
    }

    // Decodes the base64 value and performs unicode normalization.
    // @see https://datatracker.ietf.org/doc/html/rfc7613#section-3.3.2 (and #section-4.2.2)
    // @see https://dev.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
    const decoded = atob(encoded).normalize()

    // The username & password are split by the first colon.
    //=> example: "username:password"
    const index = decoded.indexOf(':')

    // The user & password are split by the first colon and MUST NOT contain control characters.
    // @see https://tools.ietf.org/html/rfc5234#appendix-B.1 (=> "CTL = %x00-1F / %x7F")
    if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
        throw BadRequestException('Invalid authorization value.')
    }

    return {
        user: decoded.substring(0, index),
        pass: decoded.substring(index + 1),
    }
}

/**
 * Type for http exceptions.
 */
interface HTTPException {
    status: number;
    statusText: string;
    reason: string;
}

/**
 * Creates an object containing all data for returning an unauthorized http response.
 *
 * @param reason exception reason
 * @constructor
 */
export function UnauthorizedException(reason: string): HTTPException {
    return {
        status: 401,
        statusText:  'Unauthorized',
        reason: reason
    }
}

/**
 * Creates an object containing all data for returning a bad request http response.
 *
 * @param reason exception reason
 * @constructor
 */
export function BadRequestException(reason: string): HTTPException {
    return {
        status: 400,
        statusText: 'Bad Request',
        reason: reason
    }
}
