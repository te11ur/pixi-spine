import {Loader, LoaderResource} from "../pixi.js/packages/loaders/src";

import {SkeletonBinary} from "./core/SkeletonBinary";
import {SkeletonJson} from "./core/SkeletonJson";
import {AtlasAttachmentLoader} from "./core/AtlasAttachmentLoader";
import {TextureAtlas} from "./core/TextureAtlas";

export class IMetadata {
    spineSkeletonScale;
    spineAtlas;
    spineAtlasSuffix;
    spineAtlasFile;
    spineMetadata;
    imageNamePrefix;
    atlasRawData;
    imageLoader;
    images;
    imageMetadata;
    image;
}


function isJson(resource) {
    return resource.type === LoaderResource.TYPE.JSON;
}

function isBuffer(resource) {
    return resource.xhrType === LoaderResource.XHR_RESPONSE_TYPE.BUFFER;
}

LoaderResource.setExtensionXhrType('skel', LoaderResource.XHR_RESPONSE_TYPE.BUFFER);

export class AtlasParser {
    static use(loader, resource, next) {
        // skip if no data, its not json, or it isn't atlas data
        if (!resource.data) {
            return;
            next();
        }

        const isJsonSpineModel = isJson(resource) && resource.data.bones;
        const isBinarySpineModel = isBuffer(resource) && (resource.extension === 'skel' || resource.metadata.spineMetadata);

        if (!isJsonSpineModel && !isBinarySpineModel) {
            return next();
        }

        let parser = null;
        let dataToParse = resource.data;

        if (isJsonSpineModel) {
            parser = new SkeletonJson(null);
        } else {
            parser = new SkeletonBinary(null);
            if (resource.data instanceof ArrayBuffer) {
                dataToParse = new Uint8Array(resource.data);
            }
        }

        const metadata = resource.metadata || {};
        const metadataSkeletonScale = metadata ? resource.metadata.spineSkeletonScale : null;

        if (metadataSkeletonScale) {
            parser.scale = metadataSkeletonScale;
        }

        const metadataAtlas = metadata ? resource.metadata.spineAtlas : null;
        if (metadataAtlas === false) {
            return next();
        }
        if (metadataAtlas && metadataAtlas.pages) {
            //its an atlas!
            parser.attachmentLoader = new AtlasAttachmentLoader(metadataAtlas);
            resource.spineData = parser.readSkeletonData(dataToParse);
            resource.spineAtlas = metadataAtlas;

            return next();
        }

        const metadataAtlasSuffix = metadata.spineAtlasSuffix || '.atlas';

        /**
         * use a bit of hackery to load the atlas file, here we assume that the .json, .atlas and .png files
         * that correspond to the spine file are in the same base URL and that the .json and .atlas files
         * have the same name
         */
        let atlasPath = resource.url;
        let queryStringPos = atlasPath.indexOf('?');
        if (queryStringPos > 0) {
            //remove querystring
            atlasPath = atlasPath.substr(0, queryStringPos)
        }
        atlasPath = atlasPath.substr(0, atlasPath.lastIndexOf('.')) + metadataAtlasSuffix;
// use atlas path as a params. (no need to use same atlas file name with json file name)
        if (resource.metadata && resource.metadata.spineAtlasFile) {
            atlasPath = resource.metadata.spineAtlasFile;
        }

//remove the baseUrl
        atlasPath = atlasPath.replace(loader.baseUrl, '');

        const atlasOptions = {
            crossOrigin: resource.crossOrigin,
            xhrType: LoaderResource.XHR_RESPONSE_TYPE.TEXT,
            metadata: metadata.spineMetadata || null,
            parentResource: resource
        };
        const imageOptions = {
            crossOrigin: resource.crossOrigin,
            metadata: metadata.imageMetadata || null,
            parentResource: resource
        };
        let baseUrl = resource.url.substr(0, resource.url.lastIndexOf('/') + 1);
//remove the baseUrl
        baseUrl = baseUrl.replace(loader.baseUrl, '');

        const namePrefix = metadata.imageNamePrefix || (resource.name + '_atlas_page_');

        const adapter = metadata.images ? staticImageLoader(metadata.images)
            : metadata.image ? staticImageLoader({'default': metadata.image})
                : metadata.imageLoader ? metadata.imageLoader(loader, namePrefix, baseUrl, imageOptions)
                    : imageLoaderAdapter(loader, namePrefix, baseUrl, imageOptions);

        const createSkeletonWithRawAtlas = function (rawData) {
            new TextureAtlas(rawData, adapter, function (spineAtlas) {
                if (spineAtlas) {
                    parser.attachmentLoader = new AtlasAttachmentLoader(spineAtlas);
                    resource.spineData = parser.readSkeletonData(dataToParse);
                    resource.spineAtlas = spineAtlas;
                }
                next();
            });
        };

        if (resource.metadata && resource.metadata.atlasRawData) {
            createSkeletonWithRawAtlas(resource.metadata.atlasRawData)
        } else {
            loader.add(resource.name + '_atlas', atlasPath, atlasOptions, function (atlasResource) {
                if (!atlasResource.error) {
                    createSkeletonWithRawAtlas(atlasResource.data);
                } else {
                    next();
                }
            });
        }
    }
}

export function imageLoaderAdapter(loader, namePrefix, baseUrl, imageOptions) {
    if (baseUrl && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
        baseUrl += '/';
    }
    return function (line, callback) {
        const name = namePrefix + line;
        const url = baseUrl + line;

        const cachedResource = loader.resources[name];
        if (cachedResource) {
            function done() {
                callback(cachedResource.texture.baseTexture)
            }

            if (cachedResource.texture) {
                done();
            } else {
                cachedResource.onAfterMiddleware.add(done);
            }
        } else {
            loader.add(name, url, imageOptions, resource => {
                if (!resource.error) {
                    callback(resource.texture.baseTexture);
                } else {
                    callback(null);
                }
            });
        }
    }
}

export function syncImageLoaderAdapter(baseUrl, crossOrigin) {
    if (baseUrl && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
        baseUrl += '/';
    }
    return function (line, callback) {
        callback(BaseTexture.from(line, crossOrigin));
    }
}

export function staticImageLoader(pages) {
    return function (line, callback) {
        let page = pages[line] || pages['default'];
        if (page && page.baseTexture) {
            callback(page.baseTexture);
        } else {
            callback(page);
        }
    }
}

if (Loader) {
    Loader.registerPlugin(AtlasParser);
}
