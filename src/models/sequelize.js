import fs from 'fs-extra';
import { default as jsyaml } from 'js-yaml';
import { Sequelize } from 'sequelize';

let sequlz;

export async function connectDB() {
    if (typeof sequlz === 'undefined') {
        const yamltext = await fs.readFile(process.env.SEQUELIZE_CONNECT, 'utf8');
        const params = jsyaml.load(yamltext);

        if (
            typeof process.env.SEQUELIZE_DBNAME !== 'undefined' &&
            process.env.SEQUELIZE_DBNAME !== ''
        ) {
            params.dbname = process.env.SEQUELIZE_DBNAME;
        }

        if (
            typeof process.env.SEQUELIZE_DBUSER !== 'undefined' &&
            process.env.SEQUELIZE_DBUSER !== ''
        ) {
            params.username = process.env.SEQUELIZE_DBUSER;
        }
        if (
            typeof process.env.SEQUELIZE_DBPASSWD !== 'undefined' &&
            process.env.SEQUELIZE_DBPASSWD !== ''
        ) {
            params.password = process.env.SEQUELIZE_DBPASSWD;
        }
        if (
            typeof process.env.SEQUELIZE_DBHOST !== 'undefined' &&
            process.env.SEQUELIZE_DBHOST !== ''
        ) {
            params.params.host = process.env.SEQUELIZE_DBHOST;
        }
        if (
            typeof process.env.SEQUELIZE_DBPORT !== 'undefined' &&
            process.env.SEQUELIZE_DBPORT !== ''
        ) {
            params.params.port = process.env.SEQUELIZE_DBPORT;
        }
        if (
            typeof process.env.SEQUELIZE_DBDIALECT !== 'undefined' &&
            process.env.SEQUELIZE_DBDIALECT !== ''
        ) {
            params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
        }

        const { dbname, username, password, params: paramz } = params;
        sequlz = new Sequelize(dbname, username, password, paramz);

        await sequlz.authenticate();
    }

    return sequlz;
}

export async function close() {
    if (sequlz) sequlz.close();
    sequlz = undefined;
}
