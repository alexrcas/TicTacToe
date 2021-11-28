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
    mensaje: '',
    mensajes: [],
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
    isRivalConectado: false,
    mensajeErrorSocket: '',
    keepAlive: {}
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
      if (!this.isRivalConectado) {
        return;
      }
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
      this.mensajes = [];
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
    },

    isAlfanumerico(e) {
      let char = String.fromCharCode(e.keyCode);
      if(/^[A-Za-z0-9]+$/.test(char)) return true;
      else e.preventDefault();
    },

    enviarMensaje: function() {
      if (this.mensaje === '') {
        return;
      }

      this.socket.emit('chat-message', {sala: this.salaActiva, mensaje: this.mensaje, jugador: this.jugadorAsignado})
      this.mensaje = '';
    }
    
  },

  created() {
    this.socket = io();

    this.socket.on('create-room', codigoSala => {
      if (codigoSala == 'error') {
        this.mensajeErrorSocket = 'Error creando la sala. Puede que ese nombre ya esté en uso'
        throw new Error(`Error creando la sala. Ya existe una sala con el nombre ${codigoSala}`)
      }
      this.mensajeErrorSocket = '';
      this.salaActiva = codigoSala;
      this.jugadorAsignado = 1;
    });

    this.socket.on('join-room', codigoSala => {
      if (codigoSala == 'error') {
        this.mensajeErrorSocket = 'Error uniéndose a la sala. La sala no existe o está llena'
        throw new Error(`Error uniendose a la sala`)
      }
      this.mensajeErrorSocket = '';
      this.salaActiva = codigoSala
      this.jugadorAsignado = 2;
    });

    this.socket.on('start-game', () => {
      this.isRivalConectado = true;

      this.keepAlive = setInterval(() => {
        this.socket.emit('keep-alive', this.salaActiva);
      }, 3000)
    });

    this.socket.on('movement', movement => {
      console.log('movimiento')
      this.celdas = movement.celdas;
      this.fichas = movement.fichas;
      this.turnoActual = movement.turnoActual;
    });

    this.socket.on('keep-alive', numberOfClients => {
      if (numberOfClients < 2) {
        this.isRivalConectado = false;
        this.mensajeErrorSocket = 'El rival se ha desconectado'
        this.salaActiva = '';
        clearInterval(this.keepAlive); 
        this.reiniciar();
      }
    });

    this.socket.on('chat-message', mensaje => {
      this.mensajes.push({jugador: mensaje.jugador, mensaje: mensaje.mensaje});
    })


  },
 
  
  beforeMount() {
    this.crearCeldas();
    this.crearFichas();

  }
  
  
})