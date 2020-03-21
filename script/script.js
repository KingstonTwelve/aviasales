'use strict';
document.addEventListener('DOMContentLoaded', () => {

    const formSearch = document.querySelector('.form-search'),
        inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
        dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
        inputCitiesTo = formSearch.querySelector('.input__cities-to'),
        dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
        inputDateDepart = formSearch.querySelector('.input__date-depart'),
        cheapestTicket = document.getElementById('cheapest-ticket'),
        otherCheapTickets = document.getElementById('other-cheap-tickets');

    //DATA

    const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
        proxy = 'https://cors-anywhere.herokuapp.com/',
        API_KEY = 'dcee80e3937b10f047b698c19bbe327f',
        calendar = 'http://min-prices.aviasales.ru/calendar_preload',
        MAX_COUNT = 4;
    let city = [];

    //FUNCTIONS

    const getData = (url, callback, reject = console.error) => {
        const request = new XMLHttpRequest(); //CREATE OBJ FOR REQUEST
        request.open('GET', url); //SETTING REQUEST
        request.addEventListener('readystatechange', () => {
            if (request.readyState !== 4) {
                return;
            }
            if (request.status === 200) { //POSITIVE ANSVER 200
                callback(request.response); //RETURN DATA
            } else {
                reject(request.status);
            }
        });


        request.send(); //SEND REQUEST
    };

    const showCity = (input, list) => {
        list.textContent = '';

        if (input.value !== '') {

            const filterCity = city.filter((item) => { //FILTER CITIES
                const fixItem = item.name.toLowerCase();
                return fixItem.startsWith(input.value.toLowerCase()); //NEW METHOD 
            });

            filterCity.forEach(item => { //ADD CITY
                const li = document.createElement('li');
                li.classList.add('dropdown__city');
                li.textContent = item.name;
                list.append(li);
            });
        }
    };

    const selectCity = (event, input, list) => {
        const target = event.target;
        if (target.tagName.toLowerCase() === 'li') {
            input.value = target.textContent;
            list.textContent = '';
        }
    };

    const getChanges = (num) => {
        if (num) {
            return num === 1 ? 'С одной пересадкой' : 'С двумя пересадками';
        } else {
            return 'Без пересадок';
        }
    };

    const getNameCity = (code) => {
        const objCity = city.find((item) => item.code === code);
        return objCity.name;
    }

    const getDate = (date) => {
        return new Date(date).toLocaleString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getLinkAviasales = (data) => {
        let link = 'https://www.aviasales.ru/search/';
        link += data.origin;
        const date = new Date(data.depart_date);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        link += day < 10 ? '0' + day : day;
        link += month < 10 ? '0' + month : month;
        link += data.destination;
        link += '1';

        return link;
    };

    const createCard = (data) => {
        const ticket = document.createElement('article');
        ticket.classList.add('ticket');

        let deep = '';

        if (data) {
            deep = `
            <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                <div class="left-side">
                    <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
                        за ${data.value}₽</a>
                </div>
                <div class="right-side">
                    <div class="block-left">
                        <div class="city__from">Вылет из города
                            <span class="city__name">${getNameCity(data.origin)}</span>
                        </div>
                        <div class="date">${getDate(data.depart_date)}</div>
                    </div>
            
                    <div class="block-right">
                        <div class="changes">${getChanges(data.number_of_changes)}</div>
                        <div class="city__to">Город назначения:
                            <span class="city__name">${getNameCity(data.destination)}</span>
                        </div>
                    </div>
                </div>
            </div>
            `;
        } else {
            deep = '<h3>Билетов нет:(</h3>';
        }

        ticket.insertAdjacentHTML('afterbegin', deep);

        return ticket;
    };

    const renderCheapDay = (cheapTicket) => {
        cheapestTicket.style.display = 'block';
        cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

        const ticket = createCard(cheapTicket[0]);
        cheapestTicket.append(ticket);
    };

    const renderCheapYear = (cheapTickets) => {
        otherCheapTickets.style.display = 'block';
        otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';

        cheapTickets.sort((a, b) => a.value - b.value);

        for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
            const ticket = createCard(cheapTickets[i]);
            otherCheapTickets.append(ticket);
        }

        console.log('cheapTickets: ', cheapTickets);
    };

    const renderCheap = (data, date) => {
        const cheapTicketYear = JSON.parse(data).best_prices;
        const cheapTicketDay = cheapTicketYear.filter((item) => {
            return item.depart_date === date;
        });

        //console.log('cheapTicketYear: ', cheapTicketYear);
        //console.log('cheapTicketDay: ', cheapTicketDay);

        renderCheapDay(cheapTicketDay);
        renderCheapYear(cheapTicketYear);
    };

    //EVENT HEANDLER
    //WHERE FROM
    inputCitiesFrom.addEventListener('input', () => {
        showCity(inputCitiesFrom, dropdownCitiesFrom);
    });

    dropdownCitiesFrom.addEventListener('click', (event) => {
        selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
    });

    //WHERE TO 
    inputCitiesTo.addEventListener('input', () => {
        showCity(inputCitiesTo, dropdownCitiesTo);
    });

    dropdownCitiesTo.addEventListener('click', (event) => {
        selectCity(event, inputCitiesTo, dropdownCitiesTo);
    });

    formSearch.addEventListener('submit', (event) => {
        event.preventDefault(); //NOT REBOOT PAGE

        const formData = {
            from: city.find((item) => inputCitiesFrom.value === item.name), //FIND RETURN FIRST EACH
            to: city.find((item) => inputCitiesTo.value === item.name),
            when: inputDateDepart.value,
        };

        if (formData.from && formData.to) {
            //const requestData = `?depart_date=${formData.when}&origin=${formData.from}&destination=${formData.to}&one_way=true`;

            const requestData = '?depart_date=' + formData.when +
                '&origin=' + formData.from.code +
                '&destination=' + formData.to.code +
                '&one_way=true';

            getData(calendar + requestData, (response) => {
                renderCheap(response, formData.when);
            }, (error) => {
                alert('В данном направлении оейсы отсуттвуют:(');
                console.error('Ошибка', error);
            });
        } else {
            alert('Введите корректное название города!)');
        }
    });

    //CALL FUNCTIONS
    getData(proxy + citiesApi, (data) => {
        city = JSON.parse(data).filter(item => item.name); //FILTER IS NAME

        city.sort((a, b) => {
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        });

        console.log(city);
    });

});