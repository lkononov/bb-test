import fs from 'fs';
import path from 'path';

import logger from './logger';

import { type IWagon } from '../types/wagon';
import { type IRollerCoaster } from '../types/rollerCoaster';
import { DirByType } from '../types/datastore';

const ENCODING = 'utf-8';
const STORAGE_DIR = path.join(
    __dirname,
    '../../datastore/',
    process.env.ENV_NAME || 'dev',
);

class Datastore {
    async saveToFile(
        dataType: DirByType,
        data: IWagon | IRollerCoaster,
    ): Promise<boolean> {
        const filePath = path.join(STORAGE_DIR, dataType, `${data.id}.json`);

        try {
            await fs.promises.writeFile(
                filePath,
                JSON.stringify(data),
                ENCODING,
            );

            logger.info('File saved: ' + filePath);
            return true;
        } catch (error) {
            logger.error(`Error while saving file ${filePath}: ${error}`);
        }

        return false;
    }

    readFromFile<T>(dataType: DirByType, id: string): T | null {
        const filePath = path.join(STORAGE_DIR, dataType, `${id}.json`);

        try {
            const data = fs.readFileSync(filePath, ENCODING);

            return JSON.parse(data) as T;
        } catch (error) {
            logger.error(`Error while reading file ${filePath}: ${error}`);
        }

        return null;
    }

    readFromDir<T>(dataType: DirByType): Array<T> {
        const folderPath = path.join(STORAGE_DIR, dataType);

        if (!fs.existsSync(folderPath)) {
            logger.error('Cannot access direcotry: ' + folderPath);
            return [];
        }

        const files = fs.readdirSync(folderPath);
        const dataSet: Array<T> = [];

        for (const file of files) {
            const id = file.replace('.json', '');
            const data = this.readFromFile<T>(dataType, id);

            if (data) {
                dataSet.push(data);
            }
        }

        return dataSet;
    }
}

export function initDatastoreFilesystem(): void {
    Object.values(DirByType).forEach((dir) => {
        const subdir = path.join(STORAGE_DIR, dir);

        if (!fs.existsSync(subdir)) {
            fs.mkdirSync(subdir, { recursive: true });
            logger.info('Initialized data store directory: ' + subdir);
        }
    });
}

const datastore = new Datastore();

export default datastore;
