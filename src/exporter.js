import {Texture} from "../pixi.js/packages/core/src/textures/Texture";

if (!Texture.prototype._updateUvs) {
    Texture.prototype._updateUvs = Texture.prototype.updateUvs;
}
