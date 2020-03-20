'use strict';
document.addEventListener('DOMContentLoaded', () => {

    const formSearch = document.querySelector('.form-search'),
        inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
        dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
        inputCitiesTo = formSearch.querySelector('.input__cities-to'),
        dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
        inputDateDepart = formSearch.querySelector('.input__date-depart');

    //DATA
    const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
        proxy = 'https://cors-anywhere.herokuapp.com/',
        API_KEY = 'dcee80e3937b10f047b698c19bbe327f',
        calendar = 'http://min-prices.aviasales.ru/calendar_preload';
    let city = [];

    //FUNCTIONS

    const getData = (url, callback) => {
        const request = new XMLHttpRequest(); //CREATE OBJ FOR REQUEST
        request.open('GET', url); //SETTING REQUEST
        request.addEventListener('readystatechange', () => {
            if (request.readyState !== 4) {
                return;
            }
            if (request.status === 200) { //POSITIVE ANSVER 200
                callback(request.response); //RETURN DATA
            } else {
                console.error(request.status);
            }
        });
        request.send(); //SEND REQUEST
    };

    const showCity = (input, list) => {
        list.textContent = '';

        if (input.value !== '') {

            const filterCity = city.filter((item) => { //FILTER CITIES
                const fixItem = item.name.toLowerCase();
                return fixItem.includes(input.value.toLowerCase());
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

    const renderCheapDay = (cheapTicket) => {
        console.log('cheapTicket: ', cheapTicket);
    };

    const renderCheapYear = (cheapTickets) => {//TO DO: sort()
        console.log('cheapTickets: ', cheapTickets);
    };

    const renderCheap = (data, date) => {
        const cheapTicketYear = JSON.parse(data).best_prices;
        const cheapTicketDay = cheapTicketYear.filter((item) => {
            return item.depart_date === date;
        });

        console.log('cheapTicketYear: ', cheapTicketYear);
        console.log('cheapTicketDay: ', cheapTicketDay);

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
            from: city.find((item) => inputCitiesFrom.value === item.name).code, //FIND RETURN FIRST EACH
            to: city.find((item) => inputCitiesTo.value === item.name).code,
            when: inputDateDepart.value,
        };

        //const requestData = `?depart_date=${formData.when}&origin=${formData.from}&destination=${formData.to}&one_way=true`;
        
        const requestData = '?depart_date=' + formData.when +
        '&origin=' + formData.from +
        '&destination=' + formData.to +
        '&one_way=true';

        getData(calendar + requestData, (response) => {
            renderCheap(response, formData.when);
        });
    });

    //CALL FUNCTIONS
    getData(proxy + citiesApi, (data) => {
        city = JSON.parse(data).filter(item => item.name); //FILTER IS NAME
    });
   
});