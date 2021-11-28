var Ficha = (function () {
    function Ficha(player, size) {
        this.player = player;
        this.size = size;
        this.selected = false;
    }
    return Ficha;
}());
var Celda = (function () {
    function Celda(i, j, ficha) {
        if (ficha === void 0) { ficha = null; }
        this.i = i;
        this.j = j;
        this.ficha = ficha;
    }
    return Celda;
}())

const app = new Vue({
  el: '#app',
  data: {
    message: 'holi',
    celdas: [],
    fichas: [],
    turnoActual: 1,
    colorTurno: ['rojas', 'azules'],
    colorJugadorAsignado: ['rojo', 'azul'],
    fichaSeleccionada: {},
    socket: {},
    codigoSala: '',
    salaActiva: '',
    jugadorAsignado: 0,
    isRivalConectado: false
  },
  
  methods: {
    
    crearCeldas: function() {
      for (let i = 0; i < 9; i++) {
        const celda = new Celda(Math.floor(i / 3), i % 3)
        this.celdas.push(celda);
      }
    },
    
    crearFichas: function() {
      for (let i = 1; i <= 6; i++) {
        const size = i;
        const fichaP1 = new Ficha(1, size * 2)
        const fichaP2 = new Ficha(2, size * 2)
        this.fichas.push(fichaP1);
        this.fichas.push(fichaP2);
      }
    },
    
    seleccionar: function(ficha) {
      if (this.turnoActual != this.jugadorAsignado) {
        return;
      }
      if (this.turnoActual != ficha.player) {
        return;
      }
      this.fichas.map(f => f.selected = false);
      this.fichaSeleccionada = ficha;
      ficha.selected = true;
    },
    
    moverFicha: function(celda) {
      if (Object.entries(this.fichaSeleccionada).length === 0) {
        return;
      }
      if (!this.isMovimientoValido(celda)) {
        return;
      }
      
      celda.ficha = this.fichaSeleccionada;
      
      this.fichas = this.fichas.filter(ficha => ficha !== this.fichaSeleccionada);
      this.fichaSeleccionada.selected = false;
      this.fichaSeleccionada = {};
      this.turnoActual = (this.turnoActual % 2) + 1;
      this.enviarMovimiento();
    },
    
    
    isMovimientoValido: function(celda) {
      if (celda.ficha == null) {
        return true;
      }
      
      if (celda.ficha.player == this.turnoActual) {
        return false;
      }
      
      if (celda.ficha.size >= this.fichaSeleccionada.size) {
        return false;
      }
      
      return true;
    },
    
    reiniciar: function() {
      this.fichaSeleccionada = {};
      this.turnoActual = 1;
      this.fichas = [];
      this.celdas = [];
      this.crearFichas();
      this.crearCeldas();
    },
    
    crearSala: function() {
      this.socket.emit('create-room', this.codigoSala);
    },

    unirseSala: function() {
      this.socket.emit('join-room', this.codigoSala);
    },

    enviarMovimiento: function() {
      this.socket.emit('movement', {sala: this.salaActiva, celdas: this.celdas, fichas: this.fichas, turnoActual: this.turnoActual})
    }
    
  },

  created() {
    this.socket = io();

    this.socket.on('create-room', codigoSala => {
      if (codigoSala == 'error') {
        throw new Error(`Error creando la sala. Ya existe una sala con el nombre ${codigoSala}`)
      }
      this.salaActiva = codigoSala;
      this.jugadorAsignado = 1;
    });

    this.socket.on('join-room', codigoSala => {
      if (codigoSala == 'error') {
        throw new Error(`Error uniendose a la sala`)
      }
      this.salaActiva = codigoSala
      this.jugadorAsignado = 2;
    });

    this.socket.on('start-game', () => {
      this.isRivalConectado = true;
    });

    this.socket.on('movement', movement => {
      this.celdas = movement.celdas;
      this.fichas = movement.fichas;
      this.turnoActual = movement.turnoActual;
    })

  },
 
  
  beforeMount() {
    this.crearCeldas();
    this.crearFichas();
  }
  
  
})