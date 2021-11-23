// https://github.com/forzub/homework

const global = {
    panels : 0,
    curent_panel : 1,
    itms_on_page : 10,
    page_load: 0,
    filter: {
        lang: "Lang",
        genre: "Genre",
    }
};

const myStorage = window.localStorage;
// --------------------------------------------------

const get_films_data = (page) => {
    const url = `https://api.tvmaze.com/shows?page=${page}`;
    fetch(url)
    .then(response => response.json())
    .then((json_data) => {
        
        if(json_data.length > 0){
            let filter_box = document.querySelector(".filterbox");
            filter_box.classList.remove("hide");

            create_filer(json_data);
            create_result_list(json_data);
            //console.log(json_data);
        }
        
    });
    
}

// --------------------------------------------------
const get_searching_films = () =>{

    let search_text = document.getElementById("search_field");    
    if(search_text.value.length < 0){return;}

    const url = `http://api.tvmaze.com/search/shows?q=${search_text.value}`;
    search_text.value = '';
    
    fetch(url)
    .then(response => response.json())
    .then((json_data) => {
        if(json_data.length > 0){
            let filter_box = document.querySelector(".filterbox");
            filter_box.classList.add("hide");
            let convert_data = [];
            convert_data = json_data.map(elem => elem.show);

            //console.log(convert_data);
            create_result_list(convert_data);
        }        
    });
}


// --------------------------------------------------

const create_filer = (json_data) => {
    let filter_lang = {};
    let filter_genre = {};
    json_data.map(element => {        
        if(element.language){
            filter_lang[element.language] = element.language;
        }
        if(element.genres){
            element.genres.map(el => filter_genre[el] = el);
        }
    });
    let filter_lang_ul = document.getElementById("filter_list_lang");
    let filter_genre_ul = document.getElementById("filter_list_genre"); 
    
    filter_lang_ul.innerHTML = '<li class="filter_li_ti">Lang</li>';
    for(let key in filter_lang){
        let li = document.createElement('li');
        li.innerText = filter_lang[key];
        filter_lang_ul.append(li);
    };
    filter_genre_ul.innerHTML = '<li class="filter_li_ti">Genre</li>';
    for(let key in filter_genre){
        let li = document.createElement('li');
        li.innerText = filter_genre[key];
        filter_genre_ul.append(li);
    };
}
// --------------------------------------------------

const create_result_list = (json_data) => {
     let target = document.querySelector(".itms_list_bx");
         target.innerHTML = "";

     if(json_data.length === 0){
            global.curent_panel = 0;
            global.panels = 0;
            document.getElementById("nav_pagenator").innerHTML = "";
            document.getElementById("nav_page").innerText = global.curent_panel;
            document.getElementById("nav_pages").innerText = global.panels;
            return;
        }
     
     let npanels = 0;
        if((json_data.length % global.itms_on_page) > 0){
            npanels = ~~(json_data.length / global.itms_on_page) + 1;
        }else{
            npanels = ~~(json_data.length / global.itms_on_page);
        }


        global.curent_panel = 1;
        global.panels = npanels;
        document.getElementById("nav_page").innerText = global.curent_panel;
        document.getElementById("nav_pages").innerText = global.panels;
        

        let start_elem = 0;
        let fin_elem = 0;
        if(json_data.length <= global.itms_on_page){
            fin_elem = json_data.length;
        }else{
            fin_elem = global.itms_on_page;
        }
             
        for(let panel = 1; panel < npanels + 1; panel++){
            
            let dom_panel = document.createElement("div");
                dom_panel.className = "result_panel hide";
                dom_panel.setAttribute("data", panel);
                if(panel === 1){dom_panel.classList.remove("hide");}
                
            let dom_row = document.createElement("div");
                dom_row.className = "row";

                for(let elem = start_elem; elem < fin_elem; elem++){
                    let dom_col = document.createElement("div");
                        dom_col.className = "col";
                    let dom_elem = document.createElement("div"); 
                        dom_elem.className = "result_itm";
                    let dom_favorite = document.createElement("div");
                        dom_favorite.className = "res_favorite";
                        dom_favorite.setAttribute('id_film',json_data[elem].id);
                        if(myStorage.getItem(`id=${dom_favorite.getAttribute('id_film')}`)){
                            dom_favorite.classList.add("saved");
                        }
                    let dom_win_info = document.createElement("div");
                        dom_win_info.className = "popup_film_info hide";

                        if(json_data[elem].image){
                            dom_elem.innerHTML = `
                            <div class="res-img" 
                            style="background: url(${json_data[elem].image["medium"] || json_data[elem].image["original"]}) no-repeat center;background-size: contain;"
                            data_name="${json_data[elem].name}"
                            data_genre="${json_data[elem].genres.join(', ')}"
                            data_lang="${json_data[elem].language}"
                            data_img="${json_data[elem].image["original"] || json_data[elem].image["medium"]}"
                            >`;
                        }else{
                            dom_elem.innerHTML = `
                            <div class="res-img" 
                            data_name="${json_data[elem].name}"
                            data_genre="${json_data[elem].genres.join(', ')}"
                            data_lang="${json_data[elem].language}"
                            data_img=""
                            >`; 
                        }
                        dom_win_info.innerHTML = json_data[elem].summary;

                        dom_elem.append(dom_favorite);
                        dom_elem.append(dom_win_info);
                        dom_col.append(dom_elem);
                        dom_row.append(dom_col);
                }
                start_elem = fin_elem;
                if((json_data.length - fin_elem) > global.itms_on_page){
                    fin_elem += global.itms_on_page;
                }else{
                    fin_elem += json_data.length - fin_elem  ;
                }
            dom_panel.append(dom_row);
            target.append(dom_panel);
        }

        
        let pages_list = document.getElementById("nav_pagenator");
            pages_list.innerHTML ="";
        
            for(let list_elem = 1; list_elem < npanels + 1; list_elem++){
            let list_itm = document.createElement("li");
            list_itm.innerText = list_elem;
            pages_list.append(list_itm);
        }
}
// --------------------------------------------------

const get_films_page = (page, filter = {lang:false, genre:false}) => {
    const url = `https://api.tvmaze.com/shows?page=${page}`;
    fetch(url)
    .then(response => response.json())
    .then(json_data => {
        let filter_lang = global.filter.lang;
        let filter_genre = global.filter.genre;
        let filtered_lang;
        let filtered_obj;

        if(filter_lang !== 'Lang'){
            filtered_lang = json_data.filter(elem => elem.language === filter_lang);
        }else{
            filtered_lang = json_data;
        }

        if(filter_genre !== 'Genre'){           
            filtered_obj = filtered_lang.filter(elem =>  elem.genres.includes(filter_genre));
        }else{
            filtered_obj = filtered_lang;
        }
        //console.log(filtered_obj);
        create_result_list(filtered_obj);
        
    });
}

// --------------------------------------------------
const set_filter = (event, id) => {
    let target = event.target;
    if (target.tagName != 'LI') return;
    document.getElementById(id).innerText = target.innerText;
    global.filter = {
        lang: document.getElementById("langs_button").innerText,
        genre: document.getElementById("genre_button").innerText
    }
    get_films_page(global.page_load);
}

// --------------------------------------------------

const set_pagas_per_list = (event) =>{
    let target = event.target;
    if (target.tagName != 'LI') return;
    global.itms_on_page = +target.getAttribute("data");
    document.getElementById("pages_set").innerText = `${global.itms_on_page} per page`;
    
    get_films_page(global.page_load);
}

// --------------------------------------------------

const set_panel_by_inc = (incriment) => {

    if((global.curent_panel + incriment) < 1) {return;}
    if((global.curent_panel + incriment) > (global.panels)) {return;}  

    let old_panel = global.curent_panel;
        global.curent_panel += incriment;
    let new_panel =  global.curent_panel;
   
    set_panel(old_panel,new_panel);
}

// --------------------------------------------------

const set_panel_by_page = (event)=>{
    let target = event.target;
    if (target.tagName != 'LI') return;
   
    let old_panel = global.curent_panel;
        global.curent_panel  = +target.innerText;
    let new_panel = +target.innerText;

    set_panel(old_panel,new_panel);
}


// --------------------------------------------------
const set_panel = (old_panel,new_panel) => {
    
    let curent_panel = document.querySelector(`.result_panel[data="${old_panel}"]`);
    let showed_panel = document.querySelector(`.result_panel[data="${new_panel}"]`);
    curent_panel.classList.add("hide");    
    showed_panel.classList.remove("hide");
    document.getElementById("nav_page").innerText = new_panel;
}

// --------------------------------------------------


document.getElementById("filter_list_genre").onclick = (event) => set_filter(event,"genre_button"); 
document.getElementById("filter_list_lang").onclick = (event) => set_filter(event,"langs_button"); 
document.getElementById("pages_set_ul").onclick = (event) => set_pagas_per_list(event); 
document.getElementById("nav_prev_button").onclick = () => set_panel_by_inc(-1); 
document.getElementById("nav_next_button").onclick = () => set_panel_by_inc(1); 
document.getElementById("nav_bar").onclick = () => {
    document.getElementById("nav_pagenator").classList.toggle("hide");
}; 
document.getElementById("nav_pagenator").onclick = (event) => set_panel_by_page(event);
document.getElementById("search_button").onclick = () => get_searching_films();

document.getElementById("nav_films").onclick = () => get_films_data(global.page_load);
document.querySelector(".modal_close").onclick = () =>{
        let modal = document.querySelector(".modal_window_section");
        let modal_win = document.querySelector(".modal_window");
        modal.classList.add("fadeOut");
        modal_win.classList.add("fadeOut");
        modal.classList.remove("fadeIn");
        modal_win.classList.remove("fadeIn");
    
        document.body.classList.remove("fixed");
};


document.querySelector(".items_listt").onclick = (event) =>{
    let target = event.target;
    if(target.classList.contains("res-img")){
        let modal = document.querySelector(".modal_window_section");
        let modal_win = document.querySelector(".modal_window");

            document.getElementById("modal_film_name").innerText = target.getAttribute("data_name");
            document.getElementById("modal_film_ganre").innerText = target.getAttribute("data_genre");
            document.getElementById("modal_film_lang").innerText = target.getAttribute("data_lang");
            document.getElementById("modal_film_description").innerHTML = target.parentNode.querySelector(".popup_film_info p").innerHTML;
            document.querySelector(".modal_window_img").setAttribute("style",`
             background: url(${target.getAttribute("data_img")}) no-repeat center;background-size: cover;
            `);        
        modal.classList.remove("fadeOut");
        modal_win.classList.remove("fadeOut");
        modal.classList.add("fadeIn");
        modal_win.classList.add("fadeIn");
        document.body.classList.add("fixed");
        document.querySelector(".modal_window_ti_bx").scrollTop = 0;
        
    }
    if(target.classList.contains("res_favorite")){
        let id = target.getAttribute("id_film");
        if(target.classList.contains("saved")){ 
            myStorage.removeItem(`id=${id}`);
            target.classList.remove("saved");
        }else{
            myStorage.setItem(`id=${id}`,"" + id);
            target.classList.add("saved");
        }
        //console.log(target);
    }
    
};

document.getElementById("nav_favorites").onclick = () => {

    if(myStorage.length === 0){return;}

    let arr_favorites = [];
    let api_favorite_films = [];
    let favarit_result = [];
    const url = "https://api.tvmaze.com/shows/";

    for(let i=0; i<localStorage.length; i++) {
        let mykey = localStorage.key(i);
        arr_favorites.push(localStorage.getItem(mykey));
      }

      //console.log(arr_favorites);
      api_favorite_films = arr_favorites.map( el => fetch(url + el).then(response => response.json()).then(el => favarit_result.push(el)));

      Promise.all(api_favorite_films).then(() => {
        let filter_box = document.querySelector(".filterbox");
            filter_box.classList.add("hide");    
            create_result_list(favarit_result);
            //console.log(favarit_result);
      });

};




window.onload = () => {
    get_films_data(global.page_load);
}



