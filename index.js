'use strict'

const ViewState = {
  cardView: 'cardView',
  listView: 'listView',
  searchView: 'searchView',
  searchListView: 'searchListView',
}


const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const container = document.querySelector('.container')
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')



const view = {
  renderMovieCard(data) {
    let rawHTML = ''
    data.forEach((item) => {
      // title, image
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
    })

    dataPanel.innerHTML = rawHTML
  },
  renderMovieList(data) {
    let rawHTML = ''
    data.forEach((item) => {
      // title, image
      rawHTML += `<div class="border-top d-flex justify-content-between flex-nowrap ">
        <div class="mt-3 h-50">
          <p class="fs-4 ">${item.title}</p>
        </div>
        <div class="mt-3 h-50">
          <button class=" btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class=" btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>`
    })

    dataPanel.innerHTML = rawHTML
  },
  showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    axios
      .get(INDEX_URL + id) // 修改這裡
      .then((response) => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release at: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image
          }" alt="movie-poster" class="img-fluid">`

      })
      .catch((err) => console.log(err))

  },
  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / model.MOVIES_PER_PAGE)
    let rawHTML = ''
    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<a class="page-link" href="#" data-page="${page}">${page}</a>`
    }
    paginator.innerHTML = rawHTML
  },
  getMoviesByPage(page, movieArr) {
    const startIndex = (page - 1) * model.MOVIES_PER_PAGE
    return movieArr.slice(startIndex, startIndex + model.MOVIES_PER_PAGE)
  },
}

const model = {
  movies: [],
  filteredMovies: [],
  MOVIES_PER_PAGE: 12,
  clickedPage: 1,
}


const controller = {
  currentView: ViewState.cardView,
  getMoviesData() {  // get original data 
    axios
      .get(INDEX_URL)
      .then((response) => {
        model.movies.push(...response.data.results)
        view.renderPaginator(model.movies.length)
        view.renderMovieCard(view.getMoviesByPage(1, model.movies))
      })
      .catch((err) => console.log(err))
  },
  viewStateControll(eventTarget) {  //select state while clicking components
    if (eventTarget.matches('#card-view')) {
      if ((this.currentView === ViewState.searchView) || (this.currentView === ViewState.searchListView)) {
        this.currentView = ViewState.searchView
      }
      else
        this.currentView = ViewState.cardView
      this.switchMoviesRenderData()
    } else if (eventTarget.matches('#list-view')) {
      if ((this.currentView === ViewState.searchView) || (this.currentView === ViewState.searchListView)) {
        this.currentView = ViewState.searchListView
      } else {
        this.currentView = ViewState.listView
      }
      this.switchMoviesRenderData()
    } else if (eventTarget.matches('#search-submit')) {
      if ((this.currentView === ViewState.searchListView) || (this.currentView === ViewState.listView)) {
        this.currentView = ViewState.searchListView
      } else {
        this.currentView = ViewState.searchView
      }
      model.clickedPage = 1  // back to first page when do searching
      this.switchMoviesRenderData()
    }
  },
  switchMoviesRenderData() {
    switch (this.currentView) {
      case ViewState.searchView:  //searching in card table
        view.renderPaginator(model.filteredMovies.length)
        if (model.clickedPage > 1)
          view.renderMovieCard(view.getMoviesByPage(model.clickedPage, model.filteredMovies))
        else
          view.renderMovieCard(view.getMoviesByPage(1, model.filteredMovies))
        break
      case ViewState.searchListView:  //searching in list table
        view.renderPaginator(model.filteredMovies.length)
        if (model.clickedPage > 1)
          view.renderMovieList(view.getMoviesByPage(model.clickedPage, model.filteredMovies))
        else
          view.renderMovieList(view.getMoviesByPage(1, model.filteredMovies))
        break
      case ViewState.listView:  // original list table
        view.renderPaginator(model.movies.length)
        if (model.clickedPage > 1)
          view.renderMovieList(view.getMoviesByPage(model.clickedPage, model.movies))
        else
          view.renderMovieList(view.getMoviesByPage(1, model.movies))
        break
      case ViewState.cardView: //original card table
        view.renderPaginator(model.movies.length)
        if (model.clickedPage > 1)
          view.renderMovieCard(view.getMoviesByPage(model.clickedPage, model.movies))
        else
          view.renderMovieCard(view.getMoviesByPage(1, model.movies))
        break
    }
  },
  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = model.movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
      return alert('此電影已經在收藏清單中！')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))  //save all data once
  }
}

//listen to paginator
paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.tagName == 'A') {
    model.clickedPage = event.target.dataset.page
    controller.switchMoviesRenderData()
  }
})

//這裡助教建議不同component切分不同監聽器
//container listen to modal,add to favorite and search function
container.addEventListener('click', function onPanelClicked(event) {
  const searchForm = document.querySelector('#search-form')
  const searchInput = document.querySelector('#search-input')
  searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    event.preventDefault()
  })

  const eventTarget = event.target
  if (eventTarget.matches('.btn-show-movie')) {
    view.showMovieModal(parseInt(eventTarget.dataset.id))
  } else if (eventTarget.matches('.btn-add-favorite')) {
    controller.addToFavorite(Number(eventTarget.dataset.id))
  } else if (eventTarget.matches('#search-submit')) {
    const keyword = searchInput.value.trim().toLowerCase()
    if (!keyword.length) {
      alert('請輸入有效字串！')
    }

    model.filteredMovies = model.movies.filter(movie => movie.title.toLowerCase().includes(keyword))

    if (model.filteredMovies.length === 0) {
      return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }
  }
  controller.viewStateControll(eventTarget)
})






controller.getMoviesData()




