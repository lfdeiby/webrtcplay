'use string';

function Setting(){
    this.id = 1;
}

Setting.prototype.open = function(){
    console.log('Abrir pantalla de configuracion de camara y audio');
    showLoading();
    this.render();
}

Setting.prototype.render = function(){
    var html = `
    <div id="settings">
        <div class="title">
            <h2>CONFIGURACIÓN</h2>
        </div>
        <div class="body">
            <div class="item">
                <label for="settingvideo"> Video </label>
                <select id="settingvideo" name="">
                    <option value="">Seleccione</option>
                </select>
            </div>
            <div class="item">
                <label for="settingmicrophone">Micrófono</label>
                <select id="settingmicrophone" name="">
                    <option value="">Seleccione</option>
                </select>
            </div>
            <div class="item">
                <label for="settingspeaker"> Altavoces </label>
                <select id="settingspeaker" name="" >
                    <option value="">Seleccione</option>
                </select>
            </div>
        </div>
        <div class="close">
            <button onclick="closePopup();">
                Listo
            </button>
        </div>
    </div>
    `
    closeLoading();
    showPopup(html);
    return;
}