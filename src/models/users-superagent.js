import { default as request } from 'superagent';
import url from 'url';
import DBG from 'debug';

const debug = DBG('notes:users-superagent');
const error = DBG('notes:error-superagent');

const auth_id = 'them';
const auth_code = 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF';

function reqURL(path) {
    const requrl = new URL(process.env.USER_SERVICE_URL);
    requrl.pathname = path;
    return requrl.toString();
}

export async function createUser(
    username,
    password,
    provider,
    familyName,
    givenName,
    middleName,
    emails,
    photos
) {
    var userData = {
        username,
        password,
        provider,
        familyName,
        givenName,
        middleName,
        emails,
        photos,
    };
    var res = await request
        .post(reqURL('/create-user'))
        .query(userData)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .auth(auth_id, auth_code);

    return res.body;
}

export async function update(
    username,
    password,
    provider,
    familyName,
    givenName,
    middleName,
    emails,
    photos
) {
    const userData = {
        username,
        password,
        provider,
        familyName,
        givenName,
        middleName,
        emails,
        photos,
    };
    var res = await request
        .post(reqURL(`/update-user/${username}`))
        .query(userData)
        .set('Content-Type', 'application/json')
        .set('Acccept', 'application/json')
        .auth(auth_id, auth_code);
    return res.body;
}

export async function findUser(username) {
    const res = await request
        .get(reqURL(`/find/${username}`))
        .set('Content-Type', 'application/json')
        .set('Acccept', 'application/json')
        .auth(auth_id, auth_code);
    return res.body;
}

export async function userPasswordCheck(username, password) {
    var res = await request
        .post(reqURL(`/password-check`))
        .query({ username, password })
        .set('Content-Type', 'application/json')
        .set('Acccept', 'application/json')
        .auth(auth_id, auth_code);
    return res.body;
}

export async function findOrCreate(profile) {
    const { username, password, provider, familyName, givenName, middleName, emails, photos } =
        profile;

    var res = await request
        .post(reqURL('/find-or-create'))
        .query({
            username,
            password,
            provider,
            familyName,
            givenName,
            middleName,
            emails,
            photos,
        })
        .set('Content-Type', 'application/json')
        .set('Acccept', 'application/json')
        .auth(auth_id, auth_code);

    return res.body;
}

export async function listUsers() {
    var res = await request
        .get(reqURL('/list'))
        .set('Content-Type', 'application/json')
        .set('Acccept', 'application/json')
        .auth(auth_id, auth_code);

    return res.body;
}
