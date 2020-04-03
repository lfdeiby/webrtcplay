'use string';

function Information(role){
    this.id = null;
    if( role == 'coach' ){
        this.url = 'api cliente';
    }
    if( role == 'client' ){
        this.url = 'api coach';
    }
    console.log("URL:", this.url);
}

Information.prototype.apiInfoUser = function(){
    showLoading();
    console.log('pedir la info via api: ' + this.url);
    this.successAjax(null);
    if( this.id == null ){
        // Solicitar via Ajax
    }else{
        this.render();
    }
}

Information.prototype.successAjax = function(data){
    this.id = 1;
    this.image = '/public/img/coach.jpg';
    this.name = 'Juan Maria Velgrano Montenegro';
    this.category = 'Entrenador personal';
    this.location = {
        country: 'Chile',
        city: 'Santiago'
    };
    this.study = {
        career: 'Entrenador Personal',
        university: 'Universidad de la UVA'
    };
    this.year = 3;
    this.review = 4.5;
    this.render();
}

Information.prototype.render = function(){
    var html = `
    <div id="coach">
        <div class="picture">
            <img src="${this.image}" alt="Coach">
        </div>
        <div class="body">
            <div class="name">
                <h2>
                    ${this.name}
                </h2>
                <div>
                    ${this.category}
                </div>
            </div>
            <div class="description">
                <div class="item">
                    Vive en: ${this.location.country} - ${this.location.city}
                </div>
                <div class="item">
                    Estudios: ${this.study.career} <br>
                    ${this.study.university}
                </div>
                <div class="item">
                    Con ${this.year} Años de experiencia en el área
                </div>
                <div class="item">
                    Calificacion ${this.review}
                </div>
            </div>
        </div>
        <div class="close">
            <button onclick="closePopup();">
                Cerrar
            </button>
        </div>
    </div>
    `;
    closeLoading();
    showPopup(html);
    return;
}