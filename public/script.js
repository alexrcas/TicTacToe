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
    fichaSeleccionada: {},
    socket: {}
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
    
    
    
  },

  created() {
    this.socket = io();
  },
 
  
  beforeMount() {
    this.crearCeldas();
    this.crearFichas();
  }
  
  
})