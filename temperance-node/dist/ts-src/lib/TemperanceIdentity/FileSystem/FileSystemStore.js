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
// Node Libraries
const FS = require("fs");
const Util = require("util");
const Path = require("path");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
/**
 * Base class for file system stores
 */
class FileSystemStore {
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param filesDir
     */
    constructor(filesDir, fileExtension) {
        this.initialised = false;
        this._filesDir = filesDir;
        this._fileExtension = fileExtension;
    }
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    initialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // This is not to be a caching store
            //await this.cacheEntireStore();
            this.initialised = true;
        });
    }
    /**
     * Gets all the ids of the objets stored in this store
     */
    getAllStoreIdsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var ids = new Array();
            try {
                this.logger ? this.logger.debug(Util.format("FileSystemStore.getAllStoreIdsAsync() : reading files from directory '%s'", this._filesDir)) : null;
                var filenames = yield readDirAsync(this._filesDir);
                for (var filename of filenames) {
                    if (this._fileExtension == null || Path.extname(filename) == this._fileExtension) {
                        try {
                            var filePath = Path.join(this._filesDir, filename);
                            var fileStat = yield statAsync(filePath);
                            if (fileStat.isFile()) {
                                ids.push(filename);
                            }
                        }
                        catch (error) {
                            this.readErrors = error;
                        }
                    }
                }
                return ids;
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * The identity factory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    cacheEntireStore() {
        return __awaiter(this, void 0, void 0, function* () {
            this.readErrors = new Map();
            this._objectCache = new Map();
            try {
                this.logger ? this.logger.debug(Util.format("FileSystemStore.cacheEntireStore() : reading files from directory '%s'", this._filesDir)) : null;
                var filenames = yield readDirAsync(this._filesDir);
                for (var filename of filenames) {
                    if (this._fileExtension == null || Path.extname(filename) == this._fileExtension) {
                        try {
                            var obj = yield this.storeReadFileAsync(filename);
                            this._objectCache.set(filename, obj);
                        }
                        catch (error) {
                            this.readErrors = error;
                        }
                    }
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    /**
     * Abstract method for reading in a file from the file system and processing the results
     * @param filePath
     */
    readFileAsync(filePath, id) {
        throw new Error("FileSystemStore.readFileAsync : function not overloaded in abstract class");
    }
    /**
     *
     */
    constructDefaultReadError(filePath, message) {
        throw new Error("FileSystemStore.constructDefaultReadError : function not overloaded in abstract class");
    }
    /**
     * Ensure the given filename has the valid extension and is a valid file not a directory before
     * attempting to read in the file
     * @param filename The filename of the file to be attempted to be read by the factory initialisation
     */
    storeReadFileAsync(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            var obj = null;
            var filePath = Path.join(this._filesDir, filename);
            this.logger ? this.logger.debug(Util.format("FileSystemStore.storeReadFileAsync : attempting to read file '%s'", filePath)) : null;
            try {
                var fileStat = yield statAsync(filePath);
            }
            catch (error) {
                // No such file exists so return a null
                return obj;
            }
            if (fileStat.isFile()) {
                try {
                    var id = filename;
                    obj = yield this.readFileAsync(filePath, id);
                }
                catch (error) {
                    // Issue with reading a file
                    this.logger ? this.logger.error(Util.format("FileSystemStore.storeReadFileAsync : error thrown when processing store file '%s'", filename)) : null;
                    throw error;
                }
            }
            else {
                // Mathing entry in the directory is not a valid file
                this.logger ? this.logger.error(Util.format("FileSystemStore.storeReadFileAsync : error file of the correct type does not exist for store file '%s'", filename)) : null;
                throw this.constructDefaultReadError(filePath, "File of the correct type does not exist");
            }
            return obj;
        });
    }
    /**
     * Accessor for getting values out of the cache
     * @param filename the filename used to identify the object
     */
    getFromCache(filename) {
        if (!this.initialised)
            throw new Error("CertificateStore.getCertificate store has not been initialised");
        if (this._objectCache != null) {
            return this._objectCache.get(filename);
        }
    }
    /**
     * Accessor for getting values from the filestore
     */
    getFromFileSystem(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialised) {
                if (filename == null)
                    return null;
                try {
                    return yield this.storeReadFileAsync(filename);
                }
                catch (error) {
                    this.logger ? this.logger.error(Util.format("FileSystemStore.getFromFile : error trying to resolve file '%s'", filename)) : null;
                    throw error;
                }
            }
            throw new Error("FileSystemStore.getFromFile store has not been initialised");
        });
    }
}
exports.default = FileSystemStore;
//# sourceMappingURL=FileSystemStore.js.map