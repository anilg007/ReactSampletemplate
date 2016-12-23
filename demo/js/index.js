"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var initialData = {
  "characters": [{
    "name": "Luke Skywalker",
    "url": "https://swapi.co/api/people/1/"
  }, {
    "name": "Darth Vader",
    "url": "https://swapi.co/api/people/4/"
  }, {
    "name": "Obi-wan Kenobi",
    "url": "https://swapi.co/api/people/unknown/"
  }, {
    "name": "R2-D2",
    "url": "https://swapi.co/api/people/2/"
  }]
};

var initialState = function initialState(initialData) {
  return {
    resources: {}, // cache of API resources (people, films, spieces, planets, vehicles etc) by url
    pages: {}, // cache of data assembled to render each page by url
    characters: initialData.characters, // Array of characters we are displaying with shape {name, url}
    selectedCharacter: {}
  };
};

// All requests to API have to be https to prevent browser mixed content warnings
var https = function https(url) {
  return url.replace(/^http(s)?/, 'https');
};

var fetch = function fetch(url) {
  // Return native browser promise, not jQuery deferrable
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: https(url),
      contentType: 'application/json',
      dataType: 'json'
    }).then(function (data, textStatus, jqXHR) {
      resolve(data);
    }, function (jqXHR, textStatus, errorThrown) {
      reject(new Error(jqXHR.responseJSON.detail));
    });
  });
};

// Return normalized url to be used as key on objects.
// Will start with http:// because all data from the api uses http:// urls
var key = function key(url) {
  return url.replace(/^http(s)?/, 'http');
};

// Define events that transform state, each event has signature :: params -> state -> state
// (url, data) -> state::{resources: {url: any}} -> state::{resources: {url: {data, loaded, error}}}
var resourceLoadedEvent = function resourceLoadedEvent(url, data) {
  return R.assocPath(['resources', key(url)], {
    data: data,
    loaded: true,
    error: null
  });
};
var resourceFailedEvent = function resourceFailedEvent(url, error) {
  return R.assocPath(['resources', key(url)], {
    data: {},
    loaded: true,
    error: error
  });
};
var resourceInPendingState = function resourceInPendingState() {
  return {
    loaded: false,
    data: {}
  };
};

// define async "commands" that ultimately dispatch events to the store.
// Command signature :: params -> (dispatch, getState) -> Promise

// fetchResource caches API response in the state, and returns a promise of the cached or fetched data
var fetchResource = function fetchResource(url) {
  return function (dispatch, getState) {
    var resource = R.pathOr(resourceInPendingState(), ['resources', key(url)], getState());
    if (resource.loaded) {
      if (resource.error) {
        return Promise.reject(resource.error);
      } else {
        return Promise.resolve(resource.data);
      }
    } else {
      return fetch(url).then(function (data) {
        dispatch(resourceLoadedEvent(url, data));
        return data;
      }, function (err) {
        dispatch(resourceFailedEvent(url, err));
        return Promise.reject(err);
      });
    }
  };
};

var loadPersonPage = function loadPersonPage(url) {
  return function (dispatch, getState) {
    var fetchResourceSet = function fetchResourceSet(property) {
      return function (data) {
        return Promise.resolve(R.prop(property, data)).then(R.map(function (url) {
          return dispatch(fetchResource(url));
        })).then(function (promises) {
          return Promise.all(promises);
        }).then(function (list) {
          return R.assoc(property, list, data);
        });
      };
    };
    var dispatchPageLoaded = function dispatchPageLoaded(url) {
      return function (data) {
        dispatch(pageLoadedEvent(url, data));
        return data;
      };
    };
    var dispatchPageFailed = function dispatchPageFailed(url) {
      return function (error) {
        dispatch(pageFailedEvent(url, error));
        return Promise.reject(error);
      };
    };
    // compose a promise to assemble all data for a person
    return dispatch(fetchResource(url)).then(fetchResourceSet('films')).then(fetchResourceSet('starships')) // just for kicks, not rendered yet
    .then(fetchResourceSet('vehicles')) // just for kicks, not rendered yet
    .then(dispatchPageLoaded(url), dispatchPageFailed(url));
  };
};

var pageLoadedEvent = function pageLoadedEvent(url, data) {
  return R.assocPath(['pages', key(url)], {
    data: data,
    loaded: true,
    error: null
  });
};
var pageFailedEvent = function pageFailedEvent(url, error) {
  return R.assocPath(['pages', key(url)], {
    data: {},
    loaded: true,
    error: error
  });
};

// Define several helpers to select data from state
// {k: (state -> v), ...} -> state -> {k: v, ...}
var selectSpec = R.applySpec;
// [(state -> a), (state -> b), ...] -> ((a, b, ...) -> c) -> state -> c
var select = R.flip(R.converge);
//const select = R.curry((selectors, final) => R.pipe(
//  R.of,
//  R.ap(selectors),
//  R.apply(final)
//))

// ({*} -> Boolean) -> property -> {*} -> {*, property: predicate()}
var assocIf = R.curry(function (predicate, property) {
  return R.ifElse(predicate, R.assoc(property, true), R.assoc(property, false));
});

var characterSelectedEvent = function characterSelectedEvent(character) {
  return R.assoc('selectedCharacter', character);
};
var sameCharacter = function sameCharacter(c1) {
  return function (c2) {
    return c1 && c2 && c1.url && c2.url && key(c1.url) === key(c2.url);
  };
};
var characterIsSelected = R.pathSatisfies(function (url) {
  return url && url.length > 0;
}, ['selectedCharacter', 'url']);
var selectionIsEmpty = R.complement(characterIsSelected);
var selectedCharacter = R.propOr({ url: '' }, 'selectedCharacter');

var emptySelection = selectSpec({
  empty: R.always(true),
  characters: R.prop('characters')
});
var selectedSelection = selectSpec({
  empty: R.always(false),
  characters: select([selectedCharacter, R.prop('characters')], function (character, characters) {
    return R.map(assocIf(sameCharacter(character), 'selected'), characters);
  }),
  person: select([selectedCharacter, R.prop('pages')], function (character, pages) {
    return R.propOr(resourceInPendingState(), key(character.url), pages);
  })
});

// final selector for the screen
var characterSelection = R.ifElse(selectionIsEmpty, emptySelection, selectedSelection);

var IconMessage = function IconMessage(_ref) {
  var icon = _ref.icon;
  var variant = _ref.variant;
  var header = _ref.header;
  var message = _ref.message;
  return React.createElement(
    "div",
    { className: "ui " + variant + " icon message" },
    React.createElement("i", { className: icon + " icon" }),
    React.createElement(
      "div",
      { className: "content" },
      React.createElement(
        "div",
        { className: "header" },
        header
      ),
      React.createElement(
        "p",
        null,
        message
      )
    )
  );
};

var LoadingIndicator = function LoadingIndicator(_ref2) {
  var loaded = _ref2.loaded;
  var error = _ref2.error;
  var children = _ref2.children;

  if (loaded) {
    return error ? React.createElement(IconMessage, { icon: "warning sign", variant: "negative", header: "Error", message: error.message }) : React.createElement(
      "div",
      null,
      children
    );
  } else {
    return React.createElement(IconMessage, { icon: "notched circle loading", variant: "", header: "Just one second", message: "We're fetching that content for you." });
  }
};

var EmptyList = function EmptyList(_ref3) {
  var message = _ref3.message;
  return React.createElement(IconMessage, { icon: "inbox", variant: "", header: "Empty", message: message });
};

var FilmListing = function FilmListing(_ref4) {
  var film = _ref4.film;
  return React.createElement(
    "div",
    { className: "ui card" },
    React.createElement(
      "div",
      { className: "content" },
      React.createElement(
        "div",
        { className: "header" },
        film.title
      ),
      React.createElement(
        "div",
        { className: "meta" },
        React.createElement(
          "span",
          null,
          "Release date"
        ),
        React.createElement(
          "a",
          null,
          film.release_date
        )
      ),
      React.createElement(
        "div",
        { className: "description" },
        film.opening_crawl
      )
    ),
    React.createElement(
      "div",
      { className: "extra content" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "span",
          null,
          "Director"
        ),
        " ",
        React.createElement(
          "span",
          null,
          film.director
        )
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "span",
          null,
          "Producer"
        ),
        " ",
        React.createElement(
          "span",
          null,
          film.producer
        )
      )
    )
  );
};

var FilmList = function FilmList(_ref5) {
  var films = _ref5.films;
  return React.createElement(
    "div",
    { className: "ui three stackable cards" },
    films.map(function (film) {
      return React.createElement(FilmListing, { key: film.url, film: film });
    })
  );
};

var PersonCard = function PersonCard(_ref6) {
  var person = _ref6.person;
  return React.createElement(
    "div",
    { className: "ui card" },
    React.createElement(
      "div",
      { className: "content" },
      React.createElement(
        "div",
        { className: "header" },
        person.name
      ),
      React.createElement(
        "div",
        { className: "meta" },
        React.createElement(
          "span",
          null,
          "Skin color"
        ),
        React.createElement(
          "a",
          null,
          person.skin_color
        )
      )
    )
  );
};

var CharacterMenuItem = function CharacterMenuItem(_ref7) {
  var character = _ref7.character;
  var onSelect = _ref7.onSelect;
  return React.createElement(
    "a",
    { className: (character.selected ? 'active' : '') + " item", onClick: onSelect },
    character.name
  );
};

var CharacterMenu = function CharacterMenu(_ref8) {
  var characters = _ref8.characters;
  var onCharacterSelected = _ref8.onCharacterSelected;
  return React.createElement(
    "div",
    { className: "ui secondary pointing menu" },
    characters.map(function (character) {
      return React.createElement(CharacterMenuItem, { key: key(character.url), character: character, onSelect: function onSelect() {
          return onCharacterSelected(character);
        } });
    })
  );
};

var SelectedCharacterView = function SelectedCharacterView(_ref9) {
  var person = _ref9.person;
  return React.createElement(
    "div",
    { style: { marginTop: '1rem' } },
    React.createElement(
      LoadingIndicator,
      person,
      React.createElement(PersonCard, { person: person.data }),
      React.createElement(
        "h3",
        { style: { marginTop: '1rem' } },
        "Movies starring ",
        person.name
      ),
      person.data.films && person.data.films.length > 0 ? React.createElement(FilmList, { films: person.data.films }) : React.createElement(EmptyList, { message: "There are no movies for " + person.data.name })
    )
  );
};

var AppLayout = function AppLayout(_ref10) {
  var empty = _ref10.empty;
  var characters = _ref10.characters;
  var onCharacterSelected = _ref10.onCharacterSelected;

  var props = _objectWithoutProperties(_ref10, ["empty", "characters", "onCharacterSelected"]);

  return React.createElement(
    "div",
    { className: "ui container" },
    React.createElement(
      "h1",
      null,
      "Star Wars Characters"
    ),
    React.createElement(CharacterMenu, {
      characters: characters,
      onCharacterSelected: onCharacterSelected }),
    empty ? React.createElement(IconMessage, { icon: "home", variant: "", header: "Welcome", message: "Please select a character from the menu" }) : React.createElement(SelectedCharacterView, props)
  );
};

var App = React.createClass({
  displayName: "App",
  render: function render() {
    return React.createElement(AppLayout, _extends({}, characterSelection(this.state), { onCharacterSelected: this.selectCharacter }));
  },
  getInitialState: function getInitialState() {
    return initialState(this.props.initialData);
  },
  componentDidMount: function componentDidMount() {
    // uncomment this line to automatically load first character
    // this.selectCharacter(this.state.characters[0])
  },

  // patchFn :: state -> patch, where patch is an object with props to be merged on state
  updateState: function updateState(patchFn) {
    var _this = this;

    this.setState(patchFn(this.state), function () {
      // for debugging
      console.log('state', _this.state);
      console.log('selection', characterSelection(_this.state));
    });
  },

  // dispatch:: (state -> state | (dispatch, getState) -> ())
  dispatch: function dispatch(fn) {
    var _this2 = this;

    if (fn.length === 1) {
      this.updateState(fn);
      return Promise.resolve();
    } else {
      return fn(this.dispatch, function () {
        return _this2.state;
      });
    }
  },
  selectCharacter: function selectCharacter(character) {
    this.dispatch(characterSelectedEvent(character));
    this.dispatch(loadPersonPage(character.url)).catch(function () {});
  }
});

ReactDOM.render(React.createElement(App, { initialData: initialData }), document.getElementById('app'));