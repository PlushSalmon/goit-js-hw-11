// -----IMPORT-----

import '../src/sass/index.scss';
import { fetchImages } from './js/fetch-images';
import { renderGallery } from './js/render-gallery';
import { onScroll, onToTopBtn } from './js/scroll';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// -----LINKS@CONSTS-----

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.btn-load-more');
let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
buttonLoadMore.addEventListener('click', onbuttonLoadMore);

onScroll();
onToTopBtn();

function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  gallery.innerHTML = '';
  buttonLoadMore.classList.add('is-hidden');

  if (query === '') {
    alertNoEmptySearch();
    return;
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        alertNoImagesFound();
      } else {
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        alertImagesFound(data);

        if (data.totalHits > perPage) {
          buttonLoadMore.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
}

function onbuttonLoadMore() {
  page += 1;
  simpleLightBox.destroy();

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        buttonLoadMore.classList.add('is-hidden');
        alertEndOfSearch();
      }
    })
    .catch(error => console.log(error));
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Ми нашли ${data.totalHits} изображений.`, {
    fontSize: '15px',
    timeout: 1000,
  });
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure(
    'Поиск пустой, пожайлуста введите запрос.',
    { fontSize: '15px', timeout: 1000 }
  );
}

function alertNoImagesFound() {
  Notiflix.Notify.failure(
    'Нет подходящих изображений',
    { fontSize: '15px', timeout: 1000 }
  );
}

function alertEndOfSearch() {
  Notiflix.Notify.failure('Больше изображений не обнаружено', {
    fontSize: '15px',
    timeout: 1000,
  });
}
