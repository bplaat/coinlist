const app = new Vue({
    el: '#app',

    data: {
        darkMode: undefined,
        baseCurrency: localStorage.baseCurrency || 'USD',

        fetchingGlobal: false,
        global: undefined,

        coinsPage: localStorage.coinsPage || 1,
        coinsSortColumn: 'market_cap_rank',
        coinsSortDir: 'asc',
        fetchingCoins: false,
        coins: []
    },

    watch: {
        darkMode(darkMode) {
            localStorage.darkMode = darkMode;
            document.body.className = darkMode ? 'dark' : '';
        },

        baseCurrency(baseCurrency) {
            localStorage.baseCurrency = baseCurrency;
            this.fetchCoins();
        },

        coinsPage(coinsPage) {
            localStorage.coinsPage = coinsPage;
            this.fetchCoins();
        }
    },

    computed: {
        sortedCoins() {
            return this.coins.sort((a, b) => {
                let modifier = 1;
                if (this.coinsSortDir == 'desc') modifier = -1;
                if (a[this.coinsSortColumn] < b[this.coinsSortColumn]) return -1 * modifier;
                if (a[this.coinsSortColumn] > b[this.coinsSortColumn]) return 1 * modifier;
                return 0;
            });
        }
    },

    filters: {
        number(value) {
            value = parseFloat(value);
            return value.toLocaleString('en-US', { minimumFractionDigits: value < 10 ? 4 : 2 });
        },

        currency(value, baseCurrency) {
            value = parseFloat(value);
            return value.toLocaleString('en-US', {
                minimumFractionDigits: value < 10 ? 4 : 2,
                style: 'currency',
                currency: baseCurrency
            }).replace(/BTC\s/, '\u20bf');
        },

        percent(value) {
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

    methods: {
        sortCoin(column) {
            if (this.coinsSortColumn == column) {
                this.coinsSortDir = this.coinsSortDir == 'asc' ? 'desc' : 'asc';
            } else {
                this.coinsSortColumn = column;
                this.coinsSortDir = 'asc';
            }
        },

        sortCoinArrow(column) {
            return this.coinsSortColumn == column ? (this.coinsSortDir == 'asc' ? '\u2193' : '\u2191'  ) : '';
        },

        fetchGlobal() {
            if (this.fetchingGlobal) {
                this.fetchGlobalRequest.abort();
            }

            this.fetchingGlobal = true;
            this.fetchGlobalRequest = new XMLHttpRequest();
            this.fetchGlobalRequest.onload = () => {
                this.global = JSON.parse(this.fetchGlobalRequest.responseText).data;
                this.fetchingGlobal = false;
            };
            this.fetchGlobalRequest.open('GET', 'https://api.coingecko.com/api/v3/global');
            this.fetchGlobalRequest.send();
        },

        fetchCoins() {
            if (this.fetchingCoins) {
                this.fetchCoinsRequest.abort();
            }

            this.fetchingCoins = true;
            this.fetchCoinsRequest = new XMLHttpRequest();
            this.fetchCoinsRequest.onload = () => {
                this.coins = JSON.parse(this.fetchCoinsRequest.responseText);
                this.fetchingCoins = false;
            };
            this.fetchCoinsRequest.open('GET', 'https://api.coingecko.com/api/v3/coins/markets?page=' + this.coinsPage + '&vs_currency=' + this.baseCurrency + '&price_change_percentage=1h,24h,7d');
            this.fetchCoinsRequest.send();
        }
    },

    created() {
        this.darkMode = localStorage.darkMode == 'true' || false;

        setInterval(() => {
            this.fetchGlobal();
            this.fetchCoins();
        }, 10 * 1000);

        this.fetchGlobal();
        this.fetchCoins();
    }
});
