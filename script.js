var app = new Vue({
    el: '#app',

    data: {
        baseCurrency: 'USD',
        fetchingGlobal: false,
        fetchingCoins: false,
        global: null,
        coins: [],
        coinsSortColumn: 'market_cap_rank',
        coinsSortDir: 'asc'
    },

    filters: {
        number: function (value) {
            value = parseFloat(value);
            return value.toLocaleString('en-US', { minimumFractionDigits: value < 10 ? 4 : 2 });
        },

        currency: function (value, baseCurrency) {
            value = parseFloat(value);
            return value.toLocaleString('en-US', {
                minimumFractionDigits: value < 10 ? 4 : 2,
                style: 'currency',
                currency: baseCurrency
            }).replace(/BTC\s/, '\u20bf');
        },

        percent: function (value) {
            value = parseFloat(value);
            return value.toFixed(2) + '%';
        }
    },

    components: {
        'change-percent': {
            props: [ 'percent' ],
            template: `<span :class="percent > 0 ? 'positive' : 'negative'">
                <span class="arrow">{{ percent > 0 ? '\u25b2' : '\u25bc' }}</span> {{ Math.abs(percent).toFixed(2) }} %
            </span>`
        }
    },

    created: function () {
        if (localStorage.baseCurrency != null) {
            this.baseCurrency = localStorage.baseCurrency;
        }

        setInterval(() => {
            this.fetchGlobal();
            this.fetchCoins();
        }, 10 * 1000);

        this.fetchGlobal();
        this.fetchCoins();
    },

    computed:{
        sortedCoins: function () {
            return this.coins.sort((a, b) => {
                let modifier = 1;
                if (this.coinsSortDir == 'desc') modifier = -1;
                if (a[this.coinsSortColumn] < b[this.coinsSortColumn]) return -1 * modifier;
                if (a[this.coinsSortColumn] > b[this.coinsSortColumn]) return 1 * modifier;
                return 0;
            });
        }
    },

    watch: {
        baseCurrency(newBaseCurrency) {
            localStorage.baseCurrency = newBaseCurrency;
            this.fetchCoins();
        }
    },

    methods: {
        sortCoin: function (column) {
            if (this.coinsSortColumn == column) {
                this.coinsSortDir = this.coinsSortDir == 'asc' ? 'desc' : 'asc';
            } else {
                this.coinsSortColumn = column;
                this.coinsSortDir = 'asc';
            }
        },

        sortCoinArrow: function (column) {
            return this.coinsSortColumn == column ? (this.coinsSortDir == 'asc' ? '\u2193' : '\u2191'  ) : '';
        },

        fetchGlobal: function () {
            if (!this.fetchingGlobal) {
                this.fetchingGlobal = true;
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    this.global = JSON.parse(xhr.responseText).data;
                    this.fetchingGlobal = false;
                };
                xhr.open('GET', 'https://api.coingecko.com/api/v3/global');
                xhr.send();
            }
        },

        fetchCoins: function () {
            if (!this.fetchingCoins) {
                this.fetchingCoins = true;
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    this.coins = JSON.parse(xhr.responseText);
                    this.fetchingCoins = false;
                };
                xhr.open('GET', 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=' + this.baseCurrency + '&price_change_percentage=1h,24h,7d');
                xhr.send();
            }
        }
    }
});
