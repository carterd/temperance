"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Util = require("util");
const Path = require("path");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
class FileSystemStore {
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param filesDir
     */
    constructor(filesDir, fileExtension) {
        this.initalised = false;
        this._filesDir = filesDir;
        this._fileExtension = fileExtension;
    }
    /**
     * The identity factory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    initalise() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.readErrors = new Map();
            try {
                this.logger ? this.logger.debug(Util.format("FileSystemFactory.initalise() : reading files from directory '%s'", this._filesDir)) : null;
                var filenames = yield readDirAsync(this._filesDir);
                for (var filename of filenames) {
                    yield this.parseAndProcessFileAsync(filename);
                }
                resolve();
            }
            catch (err) {
                return reject(err);
            }
        }));
    }
    /**
     * Abstract method for reading in a file from the file system and processing the results
     * @param filePath
     */
    processFileAsync(filePath, filename) {
        throw new Error("FileSystemFactory.readFileAsync function not overloaded in abstract class");
    }
    /**
     * Ensure the given filename has the valid extension and is a valid file not a directory before
     * attempting to read in the file
     * @param filename The filename of the file to be attempted to be read by the factory initialisation
     */
    parseAndProcessFileAsync(filename) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (this._fileExtension == null || Path.extname(filename) == this._fileExtension) {
                var filePath = Path.join(this._filesDir, filename);
                var fileStat = yield statAsync(filePath);
                if (fileStat.isFile()) {
                    yield this.processFileAsync(filePath, filename);
                }
            }
        }));
    }
}
exports.default = FileSystemStore;
//# sourceMappingURL=FileSystemStore.js.map