(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function getHash() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }
}
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
const gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
  const targetBlockElement = document.querySelector(targetBlock);
  if (targetBlockElement) {
    let headerItem = "";
    let headerItemHeight = 0;
    if (noHeader) {
      headerItem = "header.header";
      const headerElement = document.querySelector(headerItem);
      if (!headerElement.classList.contains("--header-scroll")) {
        headerElement.style.cssText = `transition-duration: 0s;`;
        headerElement.classList.add("--header-scroll");
        headerItemHeight = headerElement.offsetHeight;
        headerElement.classList.remove("--header-scroll");
        setTimeout(() => {
          headerElement.style.cssText = ``;
        }, 0);
      } else {
        headerItemHeight = headerElement.offsetHeight;
      }
    }
    if (document.documentElement.hasAttribute("data-fls-menu-open")) {
      bodyUnlock();
      document.documentElement.removeAttribute("data-fls-menu-open");
    }
    let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
    targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
    targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
    window.scrollTo({
      top: targetBlockElementPosition,
      behavior: "smooth"
    });
  }
};
function spollers() {
  const spollersArray = document.querySelectorAll("[data-fls-spollers]");
  if (spollersArray.length > 0) {
    let initSpollers2 = function(spollersArray2, matchMedia = false) {
      spollersArray2.forEach((spollersBlock) => {
        spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
        if (matchMedia.matches || !matchMedia) {
          spollersBlock.classList.add("--spoller-init");
          initSpollerBody2(spollersBlock);
        } else {
          spollersBlock.classList.remove("--spoller-init");
          initSpollerBody2(spollersBlock, false);
        }
      });
    }, initSpollerBody2 = function(spollersBlock, hideSpollerBody = true) {
      let spollerItems = spollersBlock.querySelectorAll("details");
      if (spollerItems.length) {
        spollerItems.forEach((spollerItem) => {
          let spollerTitle = spollerItem.querySelector("summary");
          if (hideSpollerBody) {
            spollerTitle.removeAttribute("tabindex");
            if (!spollerItem.hasAttribute("data-fls-spollers-open")) {
              spollerItem.open = false;
              spollerTitle.nextElementSibling.hidden = true;
            } else {
              spollerTitle.classList.add("--spoller-active");
              spollerItem.open = true;
            }
          } else {
            spollerTitle.setAttribute("tabindex", "-1");
            spollerTitle.classList.remove("--spoller-active");
            spollerItem.open = true;
            spollerTitle.nextElementSibling.hidden = false;
          }
        });
      }
    }, setSpollerAction2 = function(e) {
      const el = e.target;
      if (el.closest("summary") && el.closest("[data-fls-spollers]")) {
        e.preventDefault();
        if (el.closest("[data-fls-spollers]").classList.contains("--spoller-init")) {
          const spollerTitle = el.closest("summary");
          const spollerBlock = spollerTitle.closest("details");
          const spollersBlock = spollerTitle.closest("[data-fls-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-fls-spollers-one");
          const scrollSpoller = spollerBlock.hasAttribute("data-fls-spollers-scroll");
          const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
          if (!spollersBlock.querySelectorAll(".--slide").length) {
            if (oneSpoller && !spollerBlock.open) {
              hideSpollersBody2(spollersBlock);
            }
            !spollerBlock.open ? spollerBlock.open = true : setTimeout(() => {
              spollerBlock.open = false;
            }, spollerSpeed);
            spollerTitle.classList.toggle("--spoller-active");
            slideToggle(spollerTitle.nextElementSibling, spollerSpeed);
            if (scrollSpoller && spollerTitle.classList.contains("--spoller-active")) {
              const scrollSpollerValue = spollerBlock.dataset.flsSpollersScroll;
              const scrollSpollerOffset = +scrollSpollerValue ? +scrollSpollerValue : 0;
              const scrollSpollerNoHeader = spollerBlock.hasAttribute("data-fls-spollers-scroll-noheader") ? document.querySelector(".header").offsetHeight : 0;
              window.scrollTo(
                {
                  top: spollerBlock.offsetTop - (scrollSpollerOffset + scrollSpollerNoHeader),
                  behavior: "smooth"
                }
              );
            }
          }
        }
      }
      if (!el.closest("[data-fls-spollers]")) {
        const spollersClose = document.querySelectorAll("[data-fls-spollers-close]");
        if (spollersClose.length) {
          spollersClose.forEach((spollerClose) => {
            const spollersBlock = spollerClose.closest("[data-fls-spollers]");
            const spollerCloseBlock = spollerClose.parentNode;
            if (spollersBlock.classList.contains("--spoller-init")) {
              const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
              spollerClose.classList.remove("--spoller-active");
              slideUp(spollerClose.nextElementSibling, spollerSpeed);
              setTimeout(() => {
                spollerCloseBlock.open = false;
              }, spollerSpeed);
            }
          });
        }
      }
    }, hideSpollersBody2 = function(spollersBlock) {
      const spollerActiveBlock = spollersBlock.querySelector("details[open]");
      if (spollerActiveBlock && !spollersBlock.querySelectorAll(".--slide").length) {
        const spollerActiveTitle = spollerActiveBlock.querySelector("summary");
        const spollerSpeed = spollersBlock.dataset.flsSpollersSpeed ? parseInt(spollersBlock.dataset.flsSpollersSpeed) : 500;
        spollerActiveTitle.classList.remove("--spoller-active");
        slideUp(spollerActiveTitle.nextElementSibling, spollerSpeed);
        setTimeout(() => {
          spollerActiveBlock.open = false;
        }, spollerSpeed);
      }
    };
    var initSpollers = initSpollers2, initSpollerBody = initSpollerBody2, setSpollerAction = setSpollerAction2, hideSpollersBody = hideSpollersBody2;
    document.addEventListener("click", setSpollerAction2);
    const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
      return !item.dataset.flsSpollers.split(",")[0];
    });
    if (spollersRegular.length) {
      initSpollers2(spollersRegular);
    }
    let mdQueriesArray = dataMediaQueries(spollersArray, "flsSpollers");
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        mdQueriesItem.matchMedia.addEventListener("change", function() {
          initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        initSpollers2(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
}
window.addEventListener("load", spollers);
function isObject$1(obj) {
  return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
}
function extend$1(target, src) {
  if (target === void 0) {
    target = {};
  }
  if (src === void 0) {
    src = {};
  }
  const noExtend = ["__proto__", "constructor", "prototype"];
  Object.keys(src).filter((key) => noExtend.indexOf(key) < 0).forEach((key) => {
    if (typeof target[key] === "undefined") target[key] = src[key];
    else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
      extend$1(target[key], src[key]);
    }
  });
}
const ssrDocument = {
  body: {},
  addEventListener() {
  },
  removeEventListener() {
  },
  activeElement: {
    blur() {
    },
    nodeName: ""
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {
      }
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {
      },
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  }
};
function getDocument() {
  const doc = typeof document !== "undefined" ? document : {};
  extend$1(doc, ssrDocument);
  return doc;
}
const ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ""
  },
  location: {
    hash: "",
    host: "",
    hostname: "",
    href: "",
    origin: "",
    pathname: "",
    protocol: "",
    search: ""
  },
  history: {
    replaceState() {
    },
    pushState() {
    },
    go() {
    },
    back() {
    }
  },
  CustomEvent: function CustomEvent2() {
    return this;
  },
  addEventListener() {
  },
  removeEventListener() {
  },
  getComputedStyle() {
    return {
      getPropertyValue() {
        return "";
      }
    };
  },
  Image() {
  },
  Date() {
  },
  screen: {},
  setTimeout() {
  },
  clearTimeout() {
  },
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === "undefined") {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id) {
    if (typeof setTimeout === "undefined") {
      return;
    }
    clearTimeout(id);
  }
};
function getWindow() {
  const win = typeof window !== "undefined" ? window : {};
  extend$1(win, ssrWindow);
  return win;
}
function classesToTokens(classes2) {
  if (classes2 === void 0) {
    classes2 = "";
  }
  return classes2.trim().split(" ").filter((c) => !!c.trim());
}
function deleteProps(obj) {
  const object = obj;
  Object.keys(object).forEach((key) => {
    try {
      object[key] = null;
    } catch (e) {
    }
    try {
      delete object[key];
    } catch (e) {
    }
  });
}
function nextTick(callback, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return setTimeout(callback, delay);
}
function now() {
  return Date.now();
}
function getComputedStyle$1(el) {
  const window2 = getWindow();
  let style;
  if (window2.getComputedStyle) {
    style = window2.getComputedStyle(el, null);
  }
  if (!style && el.currentStyle) {
    style = el.currentStyle;
  }
  if (!style) {
    style = el.style;
  }
  return style;
}
function getTranslate(el, axis) {
  if (axis === void 0) {
    axis = "x";
  }
  const window2 = getWindow();
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = getComputedStyle$1(el);
  if (window2.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;
    if (curTransform.split(",").length > 6) {
      curTransform = curTransform.split(", ").map((a) => a.replace(",", ".")).join(", ");
    }
    transformMatrix = new window2.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
    matrix = transformMatrix.toString().split(",");
  }
  if (axis === "x") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m41;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
    else curTransform = parseFloat(matrix[4]);
  }
  if (axis === "y") {
    if (window2.WebKitCSSMatrix) curTransform = transformMatrix.m42;
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
    else curTransform = parseFloat(matrix[5]);
  }
  return curTransform || 0;
}
function isObject(o) {
  return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
}
function isNode(node) {
  if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
    return node instanceof HTMLElement;
  }
  return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend() {
  const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
  const noExtend = ["__proto__", "constructor", "prototype"];
  for (let i = 1; i < arguments.length; i += 1) {
    const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
    if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
      const keysArray = Object.keys(Object(nextSource)).filter((key) => noExtend.indexOf(key) < 0);
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        const nextKey = keysArray[nextIndex];
        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== void 0 && desc.enumerable) {
          if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {};
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return to;
}
function setCSSProperty(el, varName, varValue) {
  el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll(_ref) {
  let {
    swiper,
    targetPosition,
    side
  } = _ref;
  const window2 = getWindow();
  const startPosition = -swiper.translate;
  let startTime = null;
  let time;
  const duration = swiper.params.speed;
  swiper.wrapperEl.style.scrollSnapType = "none";
  window2.cancelAnimationFrame(swiper.cssModeFrameID);
  const dir = targetPosition > startPosition ? "next" : "prev";
  const isOutOfBound = (current, target) => {
    return dir === "next" && current >= target || dir === "prev" && current <= target;
  };
  const animate = () => {
    time = (/* @__PURE__ */ new Date()).getTime();
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
    if (isOutOfBound(currentPosition, targetPosition)) {
      currentPosition = targetPosition;
    }
    swiper.wrapperEl.scrollTo({
      [side]: currentPosition
    });
    if (isOutOfBound(currentPosition, targetPosition)) {
      swiper.wrapperEl.style.overflow = "hidden";
      swiper.wrapperEl.style.scrollSnapType = "";
      setTimeout(() => {
        swiper.wrapperEl.style.overflow = "";
        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });
      });
      window2.cancelAnimationFrame(swiper.cssModeFrameID);
      return;
    }
    swiper.cssModeFrameID = window2.requestAnimationFrame(animate);
  };
  animate();
}
function elementChildren(element, selector) {
  if (selector === void 0) {
    selector = "";
  }
  const window2 = getWindow();
  const children = [...element.children];
  if (window2.HTMLSlotElement && element instanceof HTMLSlotElement) {
    children.push(...element.assignedElements());
  }
  if (!selector) {
    return children;
  }
  return children.filter((el) => el.matches(selector));
}
function elementIsChildOfSlot(el, slot) {
  const elementsQueue = [slot];
  while (elementsQueue.length > 0) {
    const elementToCheck = elementsQueue.shift();
    if (el === elementToCheck) {
      return true;
    }
    elementsQueue.push(...elementToCheck.children, ...elementToCheck.shadowRoot ? elementToCheck.shadowRoot.children : [], ...elementToCheck.assignedElements ? elementToCheck.assignedElements() : []);
  }
}
function elementIsChildOf(el, parent) {
  const window2 = getWindow();
  let isChild = parent.contains(el);
  if (!isChild && window2.HTMLSlotElement && parent instanceof HTMLSlotElement) {
    const children = [...parent.assignedElements()];
    isChild = children.includes(el);
    if (!isChild) {
      isChild = elementIsChildOfSlot(el, parent);
    }
  }
  return isChild;
}
function showWarning(text) {
  try {
    console.warn(text);
    return;
  } catch (err) {
  }
}
function createElement(tag, classes2) {
  if (classes2 === void 0) {
    classes2 = [];
  }
  const el = document.createElement(tag);
  el.classList.add(...Array.isArray(classes2) ? classes2 : classesToTokens(classes2));
  return el;
}
function elementOffset(el) {
  const window2 = getWindow();
  const document2 = getDocument();
  const box = el.getBoundingClientRect();
  const body = document2.body;
  const clientTop = el.clientTop || body.clientTop || 0;
  const clientLeft = el.clientLeft || body.clientLeft || 0;
  const scrollTop = el === window2 ? window2.scrollY : el.scrollTop;
  const scrollLeft = el === window2 ? window2.scrollX : el.scrollLeft;
  return {
    top: box.top + scrollTop - clientTop,
    left: box.left + scrollLeft - clientLeft
  };
}
function elementPrevAll(el, selector) {
  const prevEls = [];
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling;
    if (selector) {
      if (prev.matches(selector)) prevEls.push(prev);
    } else prevEls.push(prev);
    el = prev;
  }
  return prevEls;
}
function elementNextAll(el, selector) {
  const nextEls = [];
  while (el.nextElementSibling) {
    const next = el.nextElementSibling;
    if (selector) {
      if (next.matches(selector)) nextEls.push(next);
    } else nextEls.push(next);
    el = next;
  }
  return nextEls;
}
function elementStyle(el, prop) {
  const window2 = getWindow();
  return window2.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
  let child = el;
  let i;
  if (child) {
    i = 0;
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }
    return i;
  }
  return void 0;
}
function elementParents(el, selector) {
  const parents = [];
  let parent = el.parentElement;
  while (parent) {
    {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}
function elementOuterSize(el, size, includeMargins) {
  const window2 = getWindow();
  {
    return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window2.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
  }
}
function makeElementsArray(el) {
  return (Array.isArray(el) ? el : [el]).filter((e) => !!e);
}
let support;
function calcSupport() {
  const window2 = getWindow();
  const document2 = getDocument();
  return {
    smoothScroll: document2.documentElement && document2.documentElement.style && "scrollBehavior" in document2.documentElement.style,
    touch: !!("ontouchstart" in window2 || window2.DocumentTouch && document2 instanceof window2.DocumentTouch)
  };
}
function getSupport() {
  if (!support) {
    support = calcSupport();
  }
  return support;
}
let deviceCached;
function calcDevice(_temp) {
  let {
    userAgent
  } = _temp === void 0 ? {} : _temp;
  const support2 = getSupport();
  const window2 = getWindow();
  const platform = window2.navigator.platform;
  const ua = userAgent || window2.navigator.userAgent;
  const device = {
    ios: false,
    android: false
  };
  const screenWidth = window2.screen.width;
  const screenHeight = window2.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const windows = platform === "Win32";
  let macos = platform === "MacIntel";
  const iPadScreens = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
  if (!ipad && macos && support2.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    if (!ipad) ipad = [0, 1, "13_0_0"];
    macos = false;
  }
  if (android && !windows) {
    device.os = "android";
    device.android = true;
  }
  if (ipad || iphone || ipod) {
    device.os = "ios";
    device.ios = true;
  }
  return device;
}
function getDevice(overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  if (!deviceCached) {
    deviceCached = calcDevice(overrides);
  }
  return deviceCached;
}
let browser;
function calcBrowser() {
  const window2 = getWindow();
  const device = getDevice();
  let needPerspectiveFix = false;
  function isSafari() {
    const ua = window2.navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
  }
  if (isSafari()) {
    const ua = String(window2.navigator.userAgent);
    if (ua.includes("Version/")) {
      const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num) => Number(num));
      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
    }
  }
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window2.navigator.userAgent);
  const isSafariBrowser = isSafari();
  const need3dFix = isSafariBrowser || isWebView && device.ios;
  return {
    isSafari: needPerspectiveFix || isSafariBrowser,
    needPerspectiveFix,
    need3dFix,
    isWebView
  };
}
function getBrowser() {
  if (!browser) {
    browser = calcBrowser();
  }
  return browser;
}
function Resize(_ref) {
  let {
    swiper,
    on,
    emit
  } = _ref;
  const window2 = getWindow();
  let observer = null;
  let animationFrame = null;
  const resizeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("beforeResize");
    emit("resize");
  };
  const createObserver = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    observer = new ResizeObserver((entries) => {
      animationFrame = window2.requestAnimationFrame(() => {
        const {
          width,
          height
        } = swiper;
        let newWidth = width;
        let newHeight = height;
        entries.forEach((_ref2) => {
          let {
            contentBoxSize,
            contentRect,
            target
          } = _ref2;
          if (target && target !== swiper.el) return;
          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
        });
        if (newWidth !== width || newHeight !== height) {
          resizeHandler();
        }
      });
    });
    observer.observe(swiper.el);
  };
  const removeObserver = () => {
    if (animationFrame) {
      window2.cancelAnimationFrame(animationFrame);
    }
    if (observer && observer.unobserve && swiper.el) {
      observer.unobserve(swiper.el);
      observer = null;
    }
  };
  const orientationChangeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit("orientationchange");
  };
  on("init", () => {
    if (swiper.params.resizeObserver && typeof window2.ResizeObserver !== "undefined") {
      createObserver();
      return;
    }
    window2.addEventListener("resize", resizeHandler);
    window2.addEventListener("orientationchange", orientationChangeHandler);
  });
  on("destroy", () => {
    removeObserver();
    window2.removeEventListener("resize", resizeHandler);
    window2.removeEventListener("orientationchange", orientationChangeHandler);
  });
}
function Observer(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const observers = [];
  const window2 = getWindow();
  const attach = function(target, options) {
    if (options === void 0) {
      options = {};
    }
    const ObserverFunc = window2.MutationObserver || window2.WebkitMutationObserver;
    const observer = new ObserverFunc((mutations) => {
      if (swiper.__preventObserver__) return;
      if (mutations.length === 1) {
        emit("observerUpdate", mutations[0]);
        return;
      }
      const observerUpdate = function observerUpdate2() {
        emit("observerUpdate", mutations[0]);
      };
      if (window2.requestAnimationFrame) {
        window2.requestAnimationFrame(observerUpdate);
      } else {
        window2.setTimeout(observerUpdate, 0);
      }
    });
    observer.observe(target, {
      attributes: typeof options.attributes === "undefined" ? true : options.attributes,
      childList: swiper.isElement || (typeof options.childList === "undefined" ? true : options).childList,
      characterData: typeof options.characterData === "undefined" ? true : options.characterData
    });
    observers.push(observer);
  };
  const init = () => {
    if (!swiper.params.observer) return;
    if (swiper.params.observeParents) {
      const containerParents = elementParents(swiper.hostEl);
      for (let i = 0; i < containerParents.length; i += 1) {
        attach(containerParents[i]);
      }
    }
    attach(swiper.hostEl, {
      childList: swiper.params.observeSlideChildren
    });
    attach(swiper.wrapperEl, {
      attributes: false
    });
  };
  const destroy = () => {
    observers.forEach((observer) => {
      observer.disconnect();
    });
    observers.splice(0, observers.length);
  };
  extendParams({
    observer: false,
    observeParents: false,
    observeSlideChildren: false
  });
  on("init", init);
  on("destroy", destroy);
}
var eventsEmitter = {
  on(events2, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    const method = priority ? "unshift" : "push";
    events2.split(" ").forEach((event) => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  },
  once(events2, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    function onceHandler() {
      self.off(events2, onceHandler);
      if (onceHandler.__emitterProxy) {
        delete onceHandler.__emitterProxy;
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      handler.apply(self, args);
    }
    onceHandler.__emitterProxy = handler;
    return self.on(events2, onceHandler, priority);
  },
  onAny(handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== "function") return self;
    const method = priority ? "unshift" : "push";
    if (self.eventsAnyListeners.indexOf(handler) < 0) {
      self.eventsAnyListeners[method](handler);
    }
    return self;
  },
  offAny(handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsAnyListeners) return self;
    const index = self.eventsAnyListeners.indexOf(handler);
    if (index >= 0) {
      self.eventsAnyListeners.splice(index, 1);
    }
    return self;
  },
  off(events2, handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    events2.split(" ").forEach((event) => {
      if (typeof handler === "undefined") {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  },
  emit() {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    let events2;
    let data;
    let context;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (typeof args[0] === "string" || Array.isArray(args[0])) {
      events2 = args[0];
      data = args.slice(1, args.length);
      context = self;
    } else {
      events2 = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
    }
    data.unshift(context);
    const eventsArray = Array.isArray(events2) ? events2 : events2.split(" ");
    eventsArray.forEach((event) => {
      if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
        self.eventsAnyListeners.forEach((eventHandler) => {
          eventHandler.apply(context, [event, ...data]);
        });
      }
      if (self.eventsListeners && self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler) => {
          eventHandler.apply(context, data);
        });
      }
    });
    return self;
  }
};
function updateSize() {
  const swiper = this;
  let width;
  let height;
  const el = swiper.el;
  if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) {
    width = swiper.params.width;
  } else {
    width = el.clientWidth;
  }
  if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) {
    height = swiper.params.height;
  } else {
    height = el.clientHeight;
  }
  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
    return;
  }
  width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
  height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
  if (Number.isNaN(width)) width = 0;
  if (Number.isNaN(height)) height = 0;
  Object.assign(swiper, {
    width,
    height,
    size: swiper.isHorizontal() ? width : height
  });
}
function updateSlides() {
  const swiper = this;
  function getDirectionPropertyValue(node, label) {
    return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
  }
  const params = swiper.params;
  const {
    wrapperEl,
    slidesEl,
    size: swiperSize,
    rtlTranslate: rtl,
    wrongRTL
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
  const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
  let snapGrid = [];
  const slidesGrid = [];
  const slidesSizesGrid = [];
  let offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === "function") {
    offsetBefore = params.slidesOffsetBefore.call(swiper);
  }
  let offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === "function") {
    offsetAfter = params.slidesOffsetAfter.call(swiper);
  }
  const previousSnapGridLength = swiper.snapGrid.length;
  const previousSlidesGridLength = swiper.slidesGrid.length;
  let spaceBetween = params.spaceBetween;
  let slidePosition = -offsetBefore;
  let prevSlideSize = 0;
  let index = 0;
  if (typeof swiperSize === "undefined") {
    return;
  }
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  swiper.virtualSize = -spaceBetween;
  slides.forEach((slideEl) => {
    if (rtl) {
      slideEl.style.marginLeft = "";
    } else {
      slideEl.style.marginRight = "";
    }
    slideEl.style.marginBottom = "";
    slideEl.style.marginTop = "";
  });
  if (params.centeredSlides && params.cssMode) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
  }
  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
  if (gridEnabled) {
    swiper.grid.initSlides(slides);
  } else if (swiper.grid) {
    swiper.grid.unsetSlides();
  }
  let slideSize;
  const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key) => {
    return typeof params.breakpoints[key].slidesPerView !== "undefined";
  }).length > 0;
  for (let i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    let slide2;
    if (slides[i]) slide2 = slides[i];
    if (gridEnabled) {
      swiper.grid.updateSlide(i, slide2, slides);
    }
    if (slides[i] && elementStyle(slide2, "display") === "none") continue;
    if (params.slidesPerView === "auto") {
      if (shouldResetSlideSize) {
        slides[i].style[swiper.getDirectionLabel("width")] = ``;
      }
      const slideStyles = getComputedStyle(slide2);
      const currentTransform = slide2.style.transform;
      const currentWebKitTransform = slide2.style.webkitTransform;
      if (currentTransform) {
        slide2.style.transform = "none";
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = "none";
      }
      if (params.roundLengths) {
        slideSize = swiper.isHorizontal() ? elementOuterSize(slide2, "width") : elementOuterSize(slide2, "height");
      } else {
        const width = getDirectionPropertyValue(slideStyles, "width");
        const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
        const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
        const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
        const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
        const boxSizing = slideStyles.getPropertyValue("box-sizing");
        if (boxSizing && boxSizing === "border-box") {
          slideSize = width + marginLeft + marginRight;
        } else {
          const {
            clientWidth,
            offsetWidth
          } = slide2;
          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
        }
      }
      if (currentTransform) {
        slide2.style.transform = currentTransform;
      }
      if (currentWebKitTransform) {
        slide2.style.webkitTransform = currentWebKitTransform;
      }
      if (params.roundLengths) slideSize = Math.floor(slideSize);
    } else {
      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
      if (params.roundLengths) slideSize = Math.floor(slideSize);
      if (slides[i]) {
        slides[i].style[swiper.getDirectionLabel("width")] = `${slideSize}px`;
      }
    }
    if (slides[i]) {
      slides[i].swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);
    if (params.centeredSlides) {
      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
    } else {
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }
    swiper.virtualSize += slideSize + spaceBetween;
    prevSlideSize = slideSize;
    index += 1;
  }
  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
  if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) {
    wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (params.setWrapperSize) {
    wrapperEl.style[swiper.getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (gridEnabled) {
    swiper.grid.updateWrapperSize(slideSize, snapGrid);
  }
  if (!params.centeredSlides) {
    const newSlidesGrid = [];
    for (let i = 0; i < snapGrid.length; i += 1) {
      let slidesGridItem = snapGrid[i];
      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
      if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
        newSlidesGrid.push(slidesGridItem);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      snapGrid.push(swiper.virtualSize - swiperSize);
    }
  }
  if (isVirtual && params.loop) {
    const size = slidesSizesGrid[0] + spaceBetween;
    if (params.slidesPerGroup > 1) {
      const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
      const groupSize = size * params.slidesPerGroup;
      for (let i = 0; i < groups; i += 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
      }
    }
    for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
      if (params.slidesPerGroup === 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
      }
      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
      swiper.virtualSize += size;
    }
  }
  if (snapGrid.length === 0) snapGrid = [0];
  if (spaceBetween !== 0) {
    const key = swiper.isHorizontal() && rtl ? "marginLeft" : swiper.getDirectionLabel("marginRight");
    slides.filter((_, slideIndex) => {
      if (!params.cssMode || params.loop) return true;
      if (slideIndex === slides.length - 1) {
        return false;
      }
      return true;
    }).forEach((slideEl) => {
      slideEl.style[key] = `${spaceBetween}px`;
    });
  }
  if (params.centeredSlides && params.centeredSlidesBounds) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
    snapGrid = snapGrid.map((snap) => {
      if (snap <= 0) return -offsetBefore;
      if (snap > maxSnap) return maxSnap + offsetAfter;
      return snap;
    });
  }
  if (params.centerInsufficientSlides) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach((slideSizeValue) => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
    if (allSlidesSize + offsetSize < swiperSize) {
      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
      snapGrid.forEach((snap, snapIndex) => {
        snapGrid[snapIndex] = snap - allSlidesOffset;
      });
      slidesGrid.forEach((snap, snapIndex) => {
        slidesGrid[snapIndex] = snap + allSlidesOffset;
      });
    }
  }
  Object.assign(swiper, {
    slides,
    snapGrid,
    slidesGrid,
    slidesSizesGrid
  });
  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
    setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
    setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
    const addToSnapGrid = -swiper.snapGrid[0];
    const addToSlidesGrid = -swiper.slidesGrid[0];
    swiper.snapGrid = swiper.snapGrid.map((v) => v + addToSnapGrid);
    swiper.slidesGrid = swiper.slidesGrid.map((v) => v + addToSlidesGrid);
  }
  if (slidesLength !== previousSlidesLength) {
    swiper.emit("slidesLengthChange");
  }
  if (snapGrid.length !== previousSnapGridLength) {
    if (swiper.params.watchOverflow) swiper.checkOverflow();
    swiper.emit("snapGridLengthChange");
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper.emit("slidesGridLengthChange");
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  swiper.emit("slidesUpdated");
  if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
    const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
    if (slidesLength <= params.maxBackfaceHiddenSlides) {
      if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
    } else if (hasClassBackfaceClassAdded) {
      swiper.el.classList.remove(backFaceHiddenClass);
    }
  }
}
function updateAutoHeight(speed) {
  const swiper = this;
  const activeSlides = [];
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  let newHeight = 0;
  let i;
  if (typeof speed === "number") {
    swiper.setTransition(speed);
  } else if (speed === true) {
    swiper.setTransition(swiper.params.speed);
  }
  const getSlideByIndex = (index) => {
    if (isVirtual) {
      return swiper.slides[swiper.getSlideIndexByData(index)];
    }
    return swiper.slides[index];
  };
  if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) {
    if (swiper.params.centeredSlides) {
      (swiper.visibleSlides || []).forEach((slide2) => {
        activeSlides.push(slide2);
      });
    } else {
      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
        const index = swiper.activeIndex + i;
        if (index > swiper.slides.length && !isVirtual) break;
        activeSlides.push(getSlideByIndex(index));
      }
    }
  } else {
    activeSlides.push(getSlideByIndex(swiper.activeIndex));
  }
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== "undefined") {
      const height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }
  if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
  const swiper = this;
  const slides = swiper.slides;
  const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
  for (let i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
  }
}
const toggleSlideClasses$1 = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesProgress(translate2) {
  if (translate2 === void 0) {
    translate2 = this && this.translate || 0;
  }
  const swiper = this;
  const params = swiper.params;
  const {
    slides,
    rtlTranslate: rtl,
    snapGrid
  } = swiper;
  if (slides.length === 0) return;
  if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
  let offsetCenter = -translate2;
  if (rtl) offsetCenter = translate2;
  swiper.visibleSlidesIndexes = [];
  swiper.visibleSlides = [];
  let spaceBetween = params.spaceBetween;
  if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size;
  } else if (typeof spaceBetween === "string") {
    spaceBetween = parseFloat(spaceBetween);
  }
  for (let i = 0; i < slides.length; i += 1) {
    const slide2 = slides[i];
    let slideOffset = slide2.swiperSlideOffset;
    if (params.cssMode && params.centeredSlides) {
      slideOffset -= slides[0].swiperSlideOffset;
    }
    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide2.swiperSlideSize + spaceBetween);
    const slideBefore = -(offsetCenter - slideOffset);
    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
    if (isVisible) {
      swiper.visibleSlides.push(slide2);
      swiper.visibleSlidesIndexes.push(i);
    }
    toggleSlideClasses$1(slide2, isVisible, params.slideVisibleClass);
    toggleSlideClasses$1(slide2, isFullyVisible, params.slideFullyVisibleClass);
    slide2.progress = rtl ? -slideProgress : slideProgress;
    slide2.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
  }
}
function updateProgress(translate2) {
  const swiper = this;
  if (typeof translate2 === "undefined") {
    const multiplier = swiper.rtlTranslate ? -1 : 1;
    translate2 = swiper && swiper.translate && swiper.translate * multiplier || 0;
  }
  const params = swiper.params;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  let {
    progress,
    isBeginning,
    isEnd,
    progressLoop
  } = swiper;
  const wasBeginning = isBeginning;
  const wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate2 - swiper.minTranslate()) / translatesDiff;
    const isBeginningRounded = Math.abs(translate2 - swiper.minTranslate()) < 1;
    const isEndRounded = Math.abs(translate2 - swiper.maxTranslate()) < 1;
    isBeginning = isBeginningRounded || progress <= 0;
    isEnd = isEndRounded || progress >= 1;
    if (isBeginningRounded) progress = 0;
    if (isEndRounded) progress = 1;
  }
  if (params.loop) {
    const firstSlideIndex = swiper.getSlideIndexByData(0);
    const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
    const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
    const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
    const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
    const translateAbs = Math.abs(translate2);
    if (translateAbs >= firstSlideTranslate) {
      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
    } else {
      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
    }
    if (progressLoop > 1) progressLoop -= 1;
  }
  Object.assign(swiper, {
    progress,
    progressLoop,
    isBeginning,
    isEnd
  });
  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate2);
  if (isBeginning && !wasBeginning) {
    swiper.emit("reachBeginning toEdge");
  }
  if (isEnd && !wasEnd) {
    swiper.emit("reachEnd toEdge");
  }
  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
    swiper.emit("fromEdge");
  }
  swiper.emit("progress", progress);
}
const toggleSlideClasses = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesClasses() {
  const swiper = this;
  const {
    slides,
    params,
    slidesEl,
    activeIndex
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const getFilteredSlide = (selector) => {
    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
  };
  let activeSlide;
  let prevSlide;
  let nextSlide;
  if (isVirtual) {
    if (params.loop) {
      let slideIndex = activeIndex - swiper.virtual.slidesBefore;
      if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
      if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
    } else {
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
    }
  } else {
    if (gridEnabled) {
      activeSlide = slides.find((slideEl) => slideEl.column === activeIndex);
      nextSlide = slides.find((slideEl) => slideEl.column === activeIndex + 1);
      prevSlide = slides.find((slideEl) => slideEl.column === activeIndex - 1);
    } else {
      activeSlide = slides[activeIndex];
    }
  }
  if (activeSlide) {
    if (!gridEnabled) {
      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !nextSlide) {
        nextSlide = slides[0];
      }
      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !prevSlide === 0) {
        prevSlide = slides[slides.length - 1];
      }
    }
  }
  slides.forEach((slideEl) => {
    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
  });
  swiper.emitSlidesClasses();
}
const processLazyPreloader = (swiper, imageEl) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
  const slideEl = imageEl.closest(slideSelector());
  if (slideEl) {
    let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
    if (!lazyEl && swiper.isElement) {
      if (slideEl.shadowRoot) {
        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
      } else {
        requestAnimationFrame(() => {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (lazyEl) lazyEl.remove();
          }
        });
      }
    }
    if (lazyEl) lazyEl.remove();
  }
};
const unlazy = (swiper, index) => {
  if (!swiper.slides[index]) return;
  const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
  if (imageEl) imageEl.removeAttribute("loading");
};
const preload = (swiper) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  let amount = swiper.params.lazyPreloadPrevNext;
  const len = swiper.slides.length;
  if (!len || !amount || amount < 0) return;
  amount = Math.min(amount, len);
  const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
  const activeIndex = swiper.activeIndex;
  if (swiper.params.grid && swiper.params.grid.rows > 1) {
    const activeColumn = activeIndex;
    const preloadColumns = [activeColumn - amount];
    preloadColumns.push(...Array.from({
      length: amount
    }).map((_, i) => {
      return activeColumn + slidesPerView + i;
    }));
    swiper.slides.forEach((slideEl, i) => {
      if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
    });
    return;
  }
  const slideIndexLastInView = activeIndex + slidesPerView - 1;
  if (swiper.params.rewind || swiper.params.loop) {
    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
      const realIndex = (i % len + len) % len;
      if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
    }
  } else {
    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
        unlazy(swiper, i);
      }
    }
  }
};
function getActiveIndexByTranslate(swiper) {
  const {
    slidesGrid,
    params
  } = swiper;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  let activeIndex;
  for (let i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== "undefined") {
      if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
        activeIndex = i;
      } else if (translate2 >= slidesGrid[i] && translate2 < slidesGrid[i + 1]) {
        activeIndex = i + 1;
      }
    } else if (translate2 >= slidesGrid[i]) {
      activeIndex = i;
    }
  }
  if (params.normalizeSlideIndex) {
    if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
  }
  return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
  const swiper = this;
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  const {
    snapGrid,
    params,
    activeIndex: previousIndex,
    realIndex: previousRealIndex,
    snapIndex: previousSnapIndex
  } = swiper;
  let activeIndex = newActiveIndex;
  let snapIndex;
  const getVirtualRealIndex = (aIndex) => {
    let realIndex2 = aIndex - swiper.virtual.slidesBefore;
    if (realIndex2 < 0) {
      realIndex2 = swiper.virtual.slides.length + realIndex2;
    }
    if (realIndex2 >= swiper.virtual.slides.length) {
      realIndex2 -= swiper.virtual.slides.length;
    }
    return realIndex2;
  };
  if (typeof activeIndex === "undefined") {
    activeIndex = getActiveIndexByTranslate(swiper);
  }
  if (snapGrid.indexOf(translate2) >= 0) {
    snapIndex = snapGrid.indexOf(translate2);
  } else {
    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  if (activeIndex === previousIndex && !swiper.params.loop) {
    if (snapIndex !== previousSnapIndex) {
      swiper.snapIndex = snapIndex;
      swiper.emit("snapIndexChange");
    }
    return;
  }
  if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
    swiper.realIndex = getVirtualRealIndex(activeIndex);
    return;
  }
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  let realIndex;
  if (swiper.virtual && params.virtual.enabled && params.loop) {
    realIndex = getVirtualRealIndex(activeIndex);
  } else if (gridEnabled) {
    const firstSlideInColumn = swiper.slides.find((slideEl) => slideEl.column === activeIndex);
    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute("data-swiper-slide-index"), 10);
    if (Number.isNaN(activeSlideIndex)) {
      activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
    }
    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
  } else if (swiper.slides[activeIndex]) {
    const slideIndex = swiper.slides[activeIndex].getAttribute("data-swiper-slide-index");
    if (slideIndex) {
      realIndex = parseInt(slideIndex, 10);
    } else {
      realIndex = activeIndex;
    }
  } else {
    realIndex = activeIndex;
  }
  Object.assign(swiper, {
    previousSnapIndex,
    snapIndex,
    previousRealIndex,
    realIndex,
    previousIndex,
    activeIndex
  });
  if (swiper.initialized) {
    preload(swiper);
  }
  swiper.emit("activeIndexChange");
  swiper.emit("snapIndexChange");
  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
    if (previousRealIndex !== realIndex) {
      swiper.emit("realIndexChange");
    }
    swiper.emit("slideChange");
  }
}
function updateClickedSlide(el, path) {
  const swiper = this;
  const params = swiper.params;
  let slide2 = el.closest(`.${params.slideClass}, swiper-slide`);
  if (!slide2 && swiper.isElement && path && path.length > 1 && path.includes(el)) {
    [...path.slice(path.indexOf(el) + 1, path.length)].forEach((pathEl) => {
      if (!slide2 && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
        slide2 = pathEl;
      }
    });
  }
  let slideFound = false;
  let slideIndex;
  if (slide2) {
    for (let i = 0; i < swiper.slides.length; i += 1) {
      if (swiper.slides[i] === slide2) {
        slideFound = true;
        slideIndex = i;
        break;
      }
    }
  }
  if (slide2 && slideFound) {
    swiper.clickedSlide = slide2;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      swiper.clickedIndex = parseInt(slide2.getAttribute("data-swiper-slide-index"), 10);
    } else {
      swiper.clickedIndex = slideIndex;
    }
  } else {
    swiper.clickedSlide = void 0;
    swiper.clickedIndex = void 0;
    return;
  }
  if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) {
    swiper.slideToClickedSlide();
  }
}
var update = {
  updateSize,
  updateSlides,
  updateAutoHeight,
  updateSlidesOffset,
  updateSlidesProgress,
  updateProgress,
  updateSlidesClasses,
  updateActiveIndex,
  updateClickedSlide
};
function getSwiperTranslate(axis) {
  if (axis === void 0) {
    axis = this.isHorizontal() ? "x" : "y";
  }
  const swiper = this;
  const {
    params,
    rtlTranslate: rtl,
    translate: translate2,
    wrapperEl
  } = swiper;
  if (params.virtualTranslate) {
    return rtl ? -translate2 : translate2;
  }
  if (params.cssMode) {
    return translate2;
  }
  let currentTranslate = getTranslate(wrapperEl, axis);
  currentTranslate += swiper.cssOverflowAdjustment();
  if (rtl) currentTranslate = -currentTranslate;
  return currentTranslate || 0;
}
function setTranslate(translate2, byController) {
  const swiper = this;
  const {
    rtlTranslate: rtl,
    params,
    wrapperEl,
    progress
  } = swiper;
  let x = 0;
  let y = 0;
  const z = 0;
  if (swiper.isHorizontal()) {
    x = rtl ? -translate2 : translate2;
  } else {
    y = translate2;
  }
  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  swiper.previousTranslate = swiper.translate;
  swiper.translate = swiper.isHorizontal() ? x : y;
  if (params.cssMode) {
    wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y;
  } else if (!params.virtualTranslate) {
    if (swiper.isHorizontal()) {
      x -= swiper.cssOverflowAdjustment();
    } else {
      y -= swiper.cssOverflowAdjustment();
    }
    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate2 - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== progress) {
    swiper.updateProgress(translate2);
  }
  swiper.emit("setTranslate", swiper.translate, byController);
}
function minTranslate() {
  return -this.snapGrid[0];
}
function maxTranslate() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate2, speed, runCallbacks, translateBounds, internal) {
  if (translate2 === void 0) {
    translate2 = 0;
  }
  if (speed === void 0) {
    speed = this.params.speed;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (translateBounds === void 0) {
    translateBounds = true;
  }
  const swiper = this;
  const {
    params,
    wrapperEl
  } = swiper;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  const minTranslate2 = swiper.minTranslate();
  const maxTranslate2 = swiper.maxTranslate();
  let newTranslate;
  if (translateBounds && translate2 > minTranslate2) newTranslate = minTranslate2;
  else if (translateBounds && translate2 < maxTranslate2) newTranslate = maxTranslate2;
  else newTranslate = translate2;
  swiper.updateProgress(newTranslate);
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    if (speed === 0) {
      wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate;
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: -newTranslate,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: -newTranslate,
        behavior: "smooth"
      });
    }
    return true;
  }
  if (speed === 0) {
    swiper.setTransition(0);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionEnd");
    }
  } else {
    swiper.setTransition(speed);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit("beforeTransitionStart", speed, internal);
      swiper.emit("transitionStart");
    }
    if (!swiper.animating) {
      swiper.animating = true;
      if (!swiper.onTranslateToWrapperTransitionEnd) {
        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd2(e) {
          if (!swiper || swiper.destroyed) return;
          if (e.target !== this) return;
          swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
          swiper.onTranslateToWrapperTransitionEnd = null;
          delete swiper.onTranslateToWrapperTransitionEnd;
          swiper.animating = false;
          if (runCallbacks) {
            swiper.emit("transitionEnd");
          }
        };
      }
      swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
    }
  }
  return true;
}
var translate = {
  getTranslate: getSwiperTranslate,
  setTranslate,
  minTranslate,
  maxTranslate,
  translateTo
};
function setTransition(duration, byController) {
  const swiper = this;
  if (!swiper.params.cssMode) {
    swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
    swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
  }
  swiper.emit("setTransition", duration, byController);
}
function transitionEmit(_ref) {
  let {
    swiper,
    runCallbacks,
    direction,
    step
  } = _ref;
  const {
    activeIndex,
    previousIndex
  } = swiper;
  let dir = direction;
  if (!dir) {
    if (activeIndex > previousIndex) dir = "next";
    else if (activeIndex < previousIndex) dir = "prev";
    else dir = "reset";
  }
  swiper.emit(`transition${step}`);
  if (runCallbacks && dir === "reset") {
    swiper.emit(`slideResetTransition${step}`);
  } else if (runCallbacks && activeIndex !== previousIndex) {
    swiper.emit(`slideChangeTransition${step}`);
    if (dir === "next") {
      swiper.emit(`slideNextTransition${step}`);
    } else {
      swiper.emit(`slidePrevTransition${step}`);
    }
  }
}
function transitionStart(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  if (params.cssMode) return;
  if (params.autoHeight) {
    swiper.updateAutoHeight();
  }
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "Start"
  });
}
function transitionEnd(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.animating = false;
  if (params.cssMode) return;
  swiper.setTransition(0);
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: "End"
  });
}
var transition = {
  setTransition,
  transitionStart,
  transitionEnd
};
function slideTo(index, speed, runCallbacks, internal, initial) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    index = parseInt(index, 10);
  }
  const swiper = this;
  let slideIndex = index;
  if (slideIndex < 0) slideIndex = 0;
  const {
    params,
    snapGrid,
    slidesGrid,
    previousIndex,
    activeIndex,
    rtlTranslate: rtl,
    wrapperEl,
    enabled
  } = swiper;
  if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  const translate2 = -snapGrid[snapIndex];
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      const normalizedTranslate = -Math.floor(translate2 * 100);
      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
      if (typeof slidesGrid[i + 1] !== "undefined") {
        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
          slideIndex = i;
        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
          slideIndex = i + 1;
        }
      } else if (normalizedTranslate >= normalizedGrid) {
        slideIndex = i;
      }
    }
  }
  if (swiper.initialized && slideIndex !== activeIndex) {
    if (!swiper.allowSlideNext && (rtl ? translate2 > swiper.translate && translate2 > swiper.minTranslate() : translate2 < swiper.translate && translate2 < swiper.minTranslate())) {
      return false;
    }
    if (!swiper.allowSlidePrev && translate2 > swiper.translate && translate2 > swiper.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) {
        return false;
      }
    }
  }
  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
    swiper.emit("beforeSlideChangeStart");
  }
  swiper.updateProgress(translate2);
  let direction;
  if (slideIndex > activeIndex) direction = "next";
  else if (slideIndex < activeIndex) direction = "prev";
  else direction = "reset";
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  const isInitialVirtual = isVirtual && initial;
  if (!isInitialVirtual && (rtl && -translate2 === swiper.translate || !rtl && translate2 === swiper.translate)) {
    swiper.updateActiveIndex(slideIndex);
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== "slide") {
      swiper.setTranslate(translate2);
    }
    if (direction !== "reset") {
      swiper.transitionStart(runCallbacks, direction);
      swiper.transitionEnd(runCallbacks, direction);
    }
    return false;
  }
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    const t = rtl ? translate2 : -translate2;
    if (speed === 0) {
      if (isVirtual) {
        swiper.wrapperEl.style.scrollSnapType = "none";
        swiper._immediateVirtual = true;
      }
      if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
        swiper._cssModeVirtualInitialSet = true;
        requestAnimationFrame(() => {
          wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
        });
      } else {
        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
      }
      if (isVirtual) {
        requestAnimationFrame(() => {
          swiper.wrapperEl.style.scrollSnapType = "";
          swiper._immediateVirtual = false;
        });
      }
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: t,
          side: isH ? "left" : "top"
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? "left" : "top"]: t,
        behavior: "smooth"
      });
    }
    return true;
  }
  const browser2 = getBrowser();
  const isSafari = browser2.isSafari;
  if (isVirtual && !initial && isSafari && swiper.isElement) {
    swiper.virtual.update(false, false, slideIndex);
  }
  swiper.setTransition(speed);
  swiper.setTranslate(translate2);
  swiper.updateActiveIndex(slideIndex);
  swiper.updateSlidesClasses();
  swiper.emit("beforeTransitionStart", speed, internal);
  swiper.transitionStart(runCallbacks, direction);
  if (speed === 0) {
    swiper.transitionEnd(runCallbacks, direction);
  } else if (!swiper.animating) {
    swiper.animating = true;
    if (!swiper.onSlideToWrapperTransitionEnd) {
      swiper.onSlideToWrapperTransitionEnd = function transitionEnd2(e) {
        if (!swiper || swiper.destroyed) return;
        if (e.target !== this) return;
        swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        swiper.onSlideToWrapperTransitionEnd = null;
        delete swiper.onSlideToWrapperTransitionEnd;
        swiper.transitionEnd(runCallbacks, direction);
      };
    }
    swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
  }
  return true;
}
function slideToLoop(index, speed, runCallbacks, internal) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === "string") {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  let newIndex = index;
  if (swiper.params.loop) {
    if (swiper.virtual && swiper.params.virtual.enabled) {
      newIndex = newIndex + swiper.virtual.slidesBefore;
    } else {
      let targetSlideIndex;
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        targetSlideIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        targetSlideIndex = swiper.getSlideIndexByData(newIndex);
      }
      const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
      const {
        centeredSlides
      } = swiper.params;
      let slidesPerView = swiper.params.slidesPerView;
      if (slidesPerView === "auto") {
        slidesPerView = swiper.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
        if (centeredSlides && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      let needLoopFix = cols - targetSlideIndex < slidesPerView;
      if (centeredSlides) {
        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
      }
      if (internal && centeredSlides && swiper.params.slidesPerView !== "auto" && !gridEnabled) {
        needLoopFix = false;
      }
      if (needLoopFix) {
        const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? "prev" : "next" : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? "next" : "prev";
        swiper.loopFix({
          direction,
          slideTo: true,
          activeSlideIndex: direction === "next" ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
          slideRealIndex: direction === "next" ? swiper.realIndex : void 0
        });
      }
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        newIndex = swiper.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === slideIndex).column;
      } else {
        newIndex = swiper.getSlideIndexByData(newIndex);
      }
    }
  }
  requestAnimationFrame(() => {
    swiper.slideTo(newIndex, speed, runCallbacks, internal);
  });
  return swiper;
}
function slideNext(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    enabled,
    params,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
  }
  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "next"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper.isEnd) {
    return swiper.slideTo(0, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}
function slidePrev(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params,
    snapGrid,
    slidesGrid,
    rtlTranslate,
    enabled,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: "prev"
    });
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
  }
  const translate2 = rtlTranslate ? swiper.translate : -swiper.translate;
  function normalize(val) {
    if (val < 0) return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate2);
  const normalizedSnapGrid = snapGrid.map((val) => normalize(val));
  const isFreeMode = params.freeMode && params.freeMode.enabled;
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === "undefined" && (params.cssMode || isFreeMode)) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== "undefined") {
      prevSnap = isFreeMode ? snapGrid[prevSnapIndex] : snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== "undefined") {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
    if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper.isBeginning) {
    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}
function slideReset(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}
function slideToClosest(speed, runCallbacks, internal, threshold) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (threshold === void 0) {
    threshold = 0.5;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === "undefined") {
    speed = swiper.params.speed;
  }
  let index = swiper.activeIndex;
  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
  const translate2 = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  if (translate2 >= swiper.snapGrid[snapIndex]) {
    const currentSnap = swiper.snapGrid[snapIndex];
    const nextSnap = swiper.snapGrid[snapIndex + 1];
    if (translate2 - currentSnap > (nextSnap - currentSnap) * threshold) {
      index += swiper.params.slidesPerGroup;
    }
  } else {
    const prevSnap = swiper.snapGrid[snapIndex - 1];
    const currentSnap = swiper.snapGrid[snapIndex];
    if (translate2 - prevSnap <= (currentSnap - prevSnap) * threshold) {
      index -= swiper.params.slidesPerGroup;
    }
  }
  index = Math.max(index, 0);
  index = Math.min(index, swiper.slidesGrid.length - 1);
  return swiper.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
  const swiper = this;
  if (swiper.destroyed) return;
  const {
    params,
    slidesEl
  } = swiper;
  const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
  let slideToIndex = swiper.clickedIndex;
  let realIndex;
  const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
  if (params.loop) {
    if (swiper.animating) return;
    realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
    if (params.centeredSlides) {
      if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
        swiper.loopFix();
        slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
        nextTick(() => {
          swiper.slideTo(slideToIndex);
        });
      } else {
        swiper.slideTo(slideToIndex);
      }
    } else if (slideToIndex > swiper.slides.length - slidesPerView) {
      swiper.loopFix();
      slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
      nextTick(() => {
        swiper.slideTo(slideToIndex);
      });
    } else {
      swiper.slideTo(slideToIndex);
    }
  } else {
    swiper.slideTo(slideToIndex);
  }
}
var slide = {
  slideTo,
  slideToLoop,
  slideNext,
  slidePrev,
  slideReset,
  slideToClosest,
  slideToClickedSlide
};
function loopCreate(slideRealIndex, initial) {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    slides.forEach((el, index) => {
      el.setAttribute("data-swiper-slide-index", index);
    });
  };
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
  const addBlankSlides = (amountOfSlides) => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper.isElement ? createElement("swiper-slide", [params.slideBlankClass]) : createElement("div", [params.slideClass, params.slideBlankClass]);
      swiper.slidesEl.append(slideEl);
    }
  };
  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
    }
    initSlides();
  } else {
    initSlides();
  }
  swiper.loopFix({
    slideRealIndex,
    direction: params.centeredSlides ? void 0 : "next",
    initial
  });
}
function loopFix(_temp) {
  let {
    slideRealIndex,
    slideTo: slideTo2 = true,
    direction,
    setTranslate: setTranslate2,
    activeSlideIndex,
    initial,
    byController,
    byMousewheel
  } = _temp === void 0 ? {} : _temp;
  const swiper = this;
  if (!swiper.params.loop) return;
  swiper.emit("beforeLoopFix");
  const {
    slides,
    allowSlidePrev,
    allowSlideNext,
    slidesEl,
    params
  } = swiper;
  const {
    centeredSlides,
    initialSlide
  } = params;
  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  if (swiper.virtual && params.virtual.enabled) {
    if (slideTo2) {
      if (!params.centeredSlides && swiper.snapIndex === 0) {
        swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
      } else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) {
        swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
      } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
        swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
      }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    swiper.emit("loopFix");
    return;
  }
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === "auto") {
    slidesPerView = swiper.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (centeredSlides && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }
  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = slidesPerGroup;
  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper.loopedSlides = loopedSlides;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (slides.length < slidesPerView + loopedSlides || swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    showWarning("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters");
  } else if (gridEnabled && params.grid.fill === "row") {
    showWarning("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
  }
  const prependSlidesIndexes = [];
  const appendSlidesIndexes = [];
  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
  const isInitialOverflow = initial && cols - initialSlide < slidesPerView && !centeredSlides;
  let activeIndex = isInitialOverflow ? initialSlide : swiper.activeIndex;
  if (typeof activeSlideIndex === "undefined") {
    activeSlideIndex = swiper.getSlideIndex(slides.find((el) => el.classList.contains(params.slideActiveClass)));
  } else {
    activeIndex = activeSlideIndex;
  }
  const isNext = direction === "next" || !direction;
  const isPrev = direction === "prev" || !direction;
  let slidesPrepended = 0;
  let slidesAppended = 0;
  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
  const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate2 === "undefined" ? -slidesPerView / 2 + 0.5 : 0);
  if (activeColIndexWithShift < loopedSlides) {
    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        const colIndexToPrepend = cols - index - 1;
        for (let i2 = slides.length - 1; i2 >= 0; i2 -= 1) {
          if (slides[i2].column === colIndexToPrepend) prependSlidesIndexes.push(i2);
        }
      } else {
        prependSlidesIndexes.push(cols - index - 1);
      }
    }
  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
    if (isInitialOverflow) {
      slidesAppended = Math.max(slidesAppended, slidesPerView - cols + initialSlide + 1);
    }
    for (let i = 0; i < slidesAppended; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        slides.forEach((slide2, slideIndex) => {
          if (slide2.column === index) appendSlidesIndexes.push(slideIndex);
        });
      } else {
        appendSlidesIndexes.push(index);
      }
    }
  }
  swiper.__preventObserver__ = true;
  requestAnimationFrame(() => {
    swiper.__preventObserver__ = false;
  });
  if (swiper.params.effect === "cards" && slides.length < slidesPerView + loopedSlides * 2) {
    if (appendSlidesIndexes.includes(activeSlideIndex)) {
      appendSlidesIndexes.splice(appendSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
    if (prependSlidesIndexes.includes(activeSlideIndex)) {
      prependSlidesIndexes.splice(prependSlidesIndexes.indexOf(activeSlideIndex), 1);
    }
  }
  if (isPrev) {
    prependSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.prepend(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  if (isNext) {
    appendSlidesIndexes.forEach((index) => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.append(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  swiper.recalcSlides();
  if (params.slidesPerView === "auto") {
    swiper.updateSlides();
  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
    swiper.slides.forEach((slide2, slideIndex) => {
      swiper.grid.updateSlide(slideIndex, slide2, swiper.slides);
    });
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  if (slideTo2) {
    if (prependSlidesIndexes.length > 0 && isPrev) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        if (setTranslate2) {
          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
          swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
          swiper.touchEventsData.currentTranslate = swiper.translate;
        }
      }
    } else if (appendSlidesIndexes.length > 0 && isNext) {
      if (typeof slideRealIndex === "undefined") {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
          if (setTranslate2) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
        swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
      }
    }
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.controller && swiper.controller.control && !byController) {
    const loopParams = {
      slideRealIndex,
      direction,
      setTranslate: setTranslate2,
      activeSlideIndex,
      byController: true
    };
    if (Array.isArray(swiper.controller.control)) {
      swiper.controller.control.forEach((c) => {
        if (!c.destroyed && c.params.loop) c.loopFix({
          ...loopParams,
          slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo2 : false
        });
      });
    } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
      swiper.controller.control.loopFix({
        ...loopParams,
        slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo2 : false
      });
    }
  }
  swiper.emit("loopFix");
}
function loopDestroy() {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || !slidesEl || swiper.virtual && swiper.params.virtual.enabled) return;
  swiper.recalcSlides();
  const newSlidesOrder = [];
  swiper.slides.forEach((slideEl) => {
    const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper.slides.forEach((slideEl) => {
    slideEl.removeAttribute("data-swiper-slide-index");
  });
  newSlidesOrder.forEach((slideEl) => {
    slidesEl.append(slideEl);
  });
  swiper.recalcSlides();
  swiper.slideTo(swiper.realIndex, 0);
}
var loop = {
  loopCreate,
  loopFix,
  loopDestroy
};
function setGrabCursor(moving) {
  const swiper = this;
  if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
  const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  el.style.cursor = "move";
  el.style.cursor = moving ? "grabbing" : "grab";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
function unsetGrabCursor() {
  const swiper = this;
  if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
    return;
  }
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
var grabCursor = {
  setGrabCursor,
  unsetGrabCursor
};
function closestElement(selector, base) {
  if (base === void 0) {
    base = this;
  }
  function __closestFrom(el) {
    if (!el || el === getDocument() || el === getWindow()) return null;
    if (el.assignedSlot) el = el.assignedSlot;
    const found = el.closest(selector);
    if (!found && !el.getRootNode) {
      return null;
    }
    return found || __closestFrom(el.getRootNode().host);
  }
  return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
  const window2 = getWindow();
  const {
    params
  } = swiper;
  const edgeSwipeDetection = params.edgeSwipeDetection;
  const edgeSwipeThreshold = params.edgeSwipeThreshold;
  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window2.innerWidth - edgeSwipeThreshold)) {
    if (edgeSwipeDetection === "prevent") {
      event.preventDefault();
      return true;
    }
    return false;
  }
  return true;
}
function onTouchStart(event) {
  const swiper = this;
  const document2 = getDocument();
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  const data = swiper.touchEventsData;
  if (e.type === "pointerdown") {
    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
      return;
    }
    data.pointerId = e.pointerId;
  } else if (e.type === "touchstart" && e.targetTouches.length === 1) {
    data.touchId = e.targetTouches[0].identifier;
  }
  if (e.type === "touchstart") {
    preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
    return;
  }
  const {
    params,
    touches,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return;
  }
  if (!swiper.animating && params.cssMode && params.loop) {
    swiper.loopFix();
  }
  let targetEl = e.target;
  if (params.touchEventsTarget === "wrapper") {
    if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
  }
  if ("which" in e && e.which === 3) return;
  if ("button" in e && e.button > 0) return;
  if (data.isTouched && data.isMoved) return;
  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
  const eventPath = e.composedPath ? e.composedPath() : e.path;
  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
    targetEl = eventPath[0];
  }
  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
  const isTargetShadow = !!(e.target && e.target.shadowRoot);
  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
    swiper.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!targetEl.closest(params.swipeHandler)) return;
  }
  touches.currentX = e.pageX;
  touches.currentY = e.pageY;
  const startX = touches.currentX;
  const startY = touches.currentY;
  if (!preventEdgeSwipe(swiper, e, startX)) {
    return;
  }
  Object.assign(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: void 0,
    startMoving: void 0
  });
  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = now();
  swiper.allowClick = true;
  swiper.updateSize();
  swiper.swipeDirection = void 0;
  if (params.threshold > 0) data.allowThresholdMove = false;
  let preventDefault = true;
  if (targetEl.matches(data.focusableElements)) {
    preventDefault = false;
    if (targetEl.nodeName === "SELECT") {
      data.isTouched = false;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== targetEl && (e.pointerType === "mouse" || e.pointerType !== "mouse" && !targetEl.matches(data.focusableElements))) {
    document2.activeElement.blur();
  }
  const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
    e.preventDefault();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
    swiper.freeMode.onTouchStart();
  }
  swiper.emit("touchStart", e);
}
function onTouchMove(event) {
  const document2 = getDocument();
  const swiper = this;
  const data = swiper.touchEventsData;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && event.pointerType === "mouse") return;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  if (e.type === "pointermove") {
    if (data.touchId !== null) return;
    const id = e.pointerId;
    if (id !== data.pointerId) return;
  }
  let targetTouch;
  if (e.type === "touchmove") {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  } else {
    targetTouch = e;
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      swiper.emit("touchMoveOpposite", e);
    }
    return;
  }
  const pageX = targetTouch.pageX;
  const pageY = targetTouch.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper.allowTouchMove) {
    if (!e.target.matches(data.focusableElements)) {
      swiper.allowClick = false;
    }
    if (data.isTouched) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY
      });
      data.touchStartTime = now();
    }
    return;
  }
  if (params.touchReleaseOnEdges && !params.loop) {
    if (swiper.isVertical()) {
      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (rtl && (pageX > touches.startX && -swiper.translate <= swiper.maxTranslate() || pageX < touches.startX && -swiper.translate >= swiper.minTranslate())) {
      return;
    } else if (!rtl && (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate())) {
      return;
    }
  }
  if (document2.activeElement && document2.activeElement.matches(data.focusableElements) && document2.activeElement !== e.target && e.pointerType !== "mouse") {
    document2.activeElement.blur();
  }
  if (document2.activeElement) {
    if (e.target === document2.activeElement && e.target.matches(data.focusableElements)) {
      data.isMoved = true;
      swiper.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper.emit("touchMove", e);
  }
  touches.previousX = touches.currentX;
  touches.previousY = touches.currentY;
  touches.currentX = pageX;
  touches.currentY = pageY;
  const diffX = touches.currentX - touches.startX;
  const diffY = touches.currentY - touches.startY;
  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
  if (typeof data.isScrolling === "undefined") {
    let touchAngle;
    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
      data.isScrolling = false;
    } else {
      if (diffX * diffX + diffY * diffY >= 25) {
        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
      }
    }
  }
  if (data.isScrolling) {
    swiper.emit("touchMoveOpposite", e);
  }
  if (typeof data.startMoving === "undefined") {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (data.isScrolling || e.type === "touchmove" && data.preventTouchMoveFromPointerMove) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper.allowClick = false;
  if (!params.cssMode && e.cancelable) {
    e.preventDefault();
  }
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }
  let diff = swiper.isHorizontal() ? diffX : diffY;
  let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
  if (params.oneWayMovement) {
    diff = Math.abs(diff) * (rtl ? 1 : -1);
    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
  }
  touches.diff = diff;
  diff *= params.touchRatio;
  if (rtl) {
    diff = -diff;
    touchesDiff = -touchesDiff;
  }
  const prevTouchesDirection = swiper.touchesDirection;
  swiper.swipeDirection = diff > 0 ? "prev" : "next";
  swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
  const isLoop = swiper.params.loop && !params.cssMode;
  const allowLoopFix = swiper.touchesDirection === "next" && swiper.allowSlideNext || swiper.touchesDirection === "prev" && swiper.allowSlidePrev;
  if (!data.isMoved) {
    if (isLoop && allowLoopFix) {
      swiper.loopFix({
        direction: swiper.swipeDirection
      });
    }
    data.startTranslate = swiper.getTranslate();
    swiper.setTransition(0);
    if (swiper.animating) {
      const evt = new window.CustomEvent("transitionend", {
        bubbles: true,
        cancelable: true,
        detail: {
          bySwiperTouchMove: true
        }
      });
      swiper.wrapperEl.dispatchEvent(evt);
    }
    data.allowMomentumBounce = false;
    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(true);
    }
    swiper.emit("sliderFirstMove", e);
  }
  (/* @__PURE__ */ new Date()).getTime();
  if (params._loopSwapReset !== false && data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
    Object.assign(touches, {
      startX: pageX,
      startY: pageY,
      currentX: pageX,
      currentY: pageY,
      startTranslate: data.currentTranslate
    });
    data.loopSwapReset = true;
    data.startTranslate = data.currentTranslate;
    return;
  }
  swiper.emit("sliderMove", e);
  data.isMoved = true;
  data.currentTranslate = diff + data.startTranslate;
  let disableParentSwiper = true;
  let resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if (diff > 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
      swiper.loopFix({
        direction: "prev",
        setTranslate: true,
        activeSlideIndex: 0
      });
    }
    if (data.currentTranslate > swiper.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      }
    }
  } else if (diff < 0) {
    if (isLoop && allowLoopFix && true && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== "auto" && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
      swiper.loopFix({
        direction: "next",
        setTranslate: true,
        activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
      });
    }
    if (data.currentTranslate < swiper.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }
    }
  }
  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }
  if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
    data.currentTranslate = data.startTranslate;
  }
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }
  if (!params.followFinger || params.cssMode) return;
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
    swiper.freeMode.onTouchMove();
  }
  swiper.updateProgress(data.currentTranslate);
  swiper.setTranslate(data.currentTranslate);
}
function onTouchEnd(event) {
  const swiper = this;
  const data = swiper.touchEventsData;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  let targetTouch;
  const isTouchEvent = e.type === "touchend" || e.type === "touchcancel";
  if (!isTouchEvent) {
    if (data.touchId !== null) return;
    if (e.pointerId !== data.pointerId) return;
    targetTouch = e;
  } else {
    targetTouch = [...e.changedTouches].find((t) => t.identifier === data.touchId);
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  }
  if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(e.type)) {
    const proceed = ["pointercancel", "contextmenu"].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
    if (!proceed) {
      return;
    }
  }
  data.pointerId = null;
  data.touchId = null;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    slidesGrid,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === "mouse") return;
  if (data.allowTouchCallbacks) {
    swiper.emit("touchEnd", e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) {
    if (data.isMoved && params.grabCursor) {
      swiper.setGrabCursor(false);
    }
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
    swiper.setGrabCursor(false);
  }
  const touchEndTime = now();
  const timeDiff = touchEndTime - data.touchStartTime;
  if (swiper.allowClick) {
    const pathTree = e.path || e.composedPath && e.composedPath();
    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
    swiper.emit("tap click", e);
    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
      swiper.emit("doubleTap doubleClick", e);
    }
  }
  data.lastClickTime = now();
  nextTick(() => {
    if (!swiper.destroyed) swiper.allowClick = true;
  });
  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;
  data.startMoving = false;
  let currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper.translate : -swiper.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.cssMode) {
    return;
  }
  if (params.freeMode && params.freeMode.enabled) {
    swiper.freeMode.onTouchEnd({
      currentPos
    });
    return;
  }
  const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
  let stopIndex = 0;
  let groupSize = swiper.slidesSizesGrid[0];
  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
    const increment2 = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (typeof slidesGrid[i + increment2] !== "undefined") {
      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment2]) {
        stopIndex = i;
        groupSize = slidesGrid[i + increment2] - slidesGrid[i];
      }
    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }
  let rewindFirstIndex = null;
  let rewindLastIndex = null;
  if (params.rewind) {
    if (swiper.isBeginning) {
      rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    } else if (swiper.isEnd) {
      rewindFirstIndex = 0;
    }
  }
  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
  if (timeDiff > params.longSwipesMs) {
    if (!params.longSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === "next") {
      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);
      else swiper.slideTo(stopIndex);
    }
    if (swiper.swipeDirection === "prev") {
      if (ratio > 1 - params.longSwipesRatio) {
        swiper.slideTo(stopIndex + increment);
      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
        swiper.slideTo(rewindLastIndex);
      } else {
        swiper.slideTo(stopIndex);
      }
    }
  } else {
    if (!params.shortSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
    if (!isNavButtonTarget) {
      if (swiper.swipeDirection === "next") {
        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
      }
      if (swiper.swipeDirection === "prev") {
        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
      }
    } else if (e.target === swiper.navigation.nextEl) {
      swiper.slideTo(stopIndex + increment);
    } else {
      swiper.slideTo(stopIndex);
    }
  }
}
function onResize() {
  const swiper = this;
  const {
    params,
    el
  } = swiper;
  if (el && el.offsetWidth === 0) return;
  if (params.breakpoints) {
    swiper.setBreakpoint();
  }
  const {
    allowSlideNext,
    allowSlidePrev,
    snapGrid
  } = swiper;
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;
  swiper.updateSize();
  swiper.updateSlides();
  swiper.updateSlidesClasses();
  const isVirtualLoop = isVirtual && params.loop;
  if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
  } else {
    if (swiper.params.loop && !isVirtual) {
      swiper.slideToLoop(swiper.realIndex, 0, false, true);
    } else {
      swiper.slideTo(swiper.activeIndex, 0, false, true);
    }
  }
  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
    clearTimeout(swiper.autoplay.resizeTimeout);
    swiper.autoplay.resizeTimeout = setTimeout(() => {
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.resume();
      }
    }, 500);
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
    swiper.checkOverflow();
  }
}
function onClick(e) {
  const swiper = this;
  if (!swiper.enabled) return;
  if (!swiper.allowClick) {
    if (swiper.params.preventClicks) e.preventDefault();
    if (swiper.params.preventClicksPropagation && swiper.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}
function onScroll() {
  const swiper = this;
  const {
    wrapperEl,
    rtlTranslate,
    enabled
  } = swiper;
  if (!enabled) return;
  swiper.previousTranslate = swiper.translate;
  if (swiper.isHorizontal()) {
    swiper.translate = -wrapperEl.scrollLeft;
  } else {
    swiper.translate = -wrapperEl.scrollTop;
  }
  if (swiper.translate === 0) swiper.translate = 0;
  swiper.updateActiveIndex();
  swiper.updateSlidesClasses();
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== swiper.progress) {
    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
  }
  swiper.emit("setTranslate", swiper.translate, false);
}
function onLoad(e) {
  const swiper = this;
  processLazyPreloader(swiper, e.target);
  if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) {
    return;
  }
  swiper.update();
}
function onDocumentTouchStart() {
  const swiper = this;
  if (swiper.documentTouchHandlerProceeded) return;
  swiper.documentTouchHandlerProceeded = true;
  if (swiper.params.touchReleaseOnEdges) {
    swiper.el.style.touchAction = "auto";
  }
}
const events = (swiper, method) => {
  const document2 = getDocument();
  const {
    params,
    el,
    wrapperEl,
    device
  } = swiper;
  const capture = !!params.nested;
  const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
  const swiperMethod = method;
  if (!el || typeof el === "string") return;
  document2[domMethod]("touchstart", swiper.onDocumentTouchStart, {
    passive: false,
    capture
  });
  el[domMethod]("touchstart", swiper.onTouchStart, {
    passive: false
  });
  el[domMethod]("pointerdown", swiper.onTouchStart, {
    passive: false
  });
  document2[domMethod]("touchmove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("pointermove", swiper.onTouchMove, {
    passive: false,
    capture
  });
  document2[domMethod]("touchend", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerup", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointercancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("touchcancel", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerout", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("pointerleave", swiper.onTouchEnd, {
    passive: true
  });
  document2[domMethod]("contextmenu", swiper.onTouchEnd, {
    passive: true
  });
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]("click", swiper.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]("scroll", swiper.onScroll);
  }
  if (params.updateOnWindowResize) {
    swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true);
  } else {
    swiper[swiperMethod]("observerUpdate", onResize, true);
  }
  el[domMethod]("load", swiper.onLoad, {
    capture: true
  });
};
function attachEvents() {
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.onTouchStart = onTouchStart.bind(swiper);
  swiper.onTouchMove = onTouchMove.bind(swiper);
  swiper.onTouchEnd = onTouchEnd.bind(swiper);
  swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
  if (params.cssMode) {
    swiper.onScroll = onScroll.bind(swiper);
  }
  swiper.onClick = onClick.bind(swiper);
  swiper.onLoad = onLoad.bind(swiper);
  events(swiper, "on");
}
function detachEvents() {
  const swiper = this;
  events(swiper, "off");
}
var events$1 = {
  attachEvents,
  detachEvents
};
const isGridEnabled = (swiper, params) => {
  return swiper.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
  const swiper = this;
  const {
    realIndex,
    initialized,
    params,
    el
  } = swiper;
  const breakpoints2 = params.breakpoints;
  if (!breakpoints2 || breakpoints2 && Object.keys(breakpoints2).length === 0) return;
  const document2 = getDocument();
  const breakpointsBase = params.breakpointsBase === "window" || !params.breakpointsBase ? params.breakpointsBase : "container";
  const breakpointContainer = ["window", "container"].includes(params.breakpointsBase) || !params.breakpointsBase ? swiper.el : document2.querySelector(params.breakpointsBase);
  const breakpoint = swiper.getBreakpoint(breakpoints2, breakpointsBase, breakpointContainer);
  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
  const breakpointOnlyParams = breakpoint in breakpoints2 ? breakpoints2[breakpoint] : void 0;
  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
  const wasMultiRow = isGridEnabled(swiper, params);
  const isMultiRow = isGridEnabled(swiper, breakpointParams);
  const wasGrabCursor = swiper.params.grabCursor;
  const isGrabCursor = breakpointParams.grabCursor;
  const wasEnabled = params.enabled;
  if (wasMultiRow && !isMultiRow) {
    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
    swiper.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    el.classList.add(`${params.containerModifierClass}grid`);
    if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") {
      el.classList.add(`${params.containerModifierClass}grid-column`);
    }
    swiper.emitContainerClasses();
  }
  if (wasGrabCursor && !isGrabCursor) {
    swiper.unsetGrabCursor();
  } else if (!wasGrabCursor && isGrabCursor) {
    swiper.setGrabCursor();
  }
  ["navigation", "pagination", "scrollbar"].forEach((prop) => {
    if (typeof breakpointParams[prop] === "undefined") return;
    const wasModuleEnabled = params[prop] && params[prop].enabled;
    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
    if (wasModuleEnabled && !isModuleEnabled) {
      swiper[prop].disable();
    }
    if (!wasModuleEnabled && isModuleEnabled) {
      swiper[prop].enable();
    }
  });
  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
  const wasLoop = params.loop;
  if (directionChanged && initialized) {
    swiper.changeDirection();
  }
  extend(swiper.params, breakpointParams);
  const isEnabled = swiper.params.enabled;
  const hasLoop = swiper.params.loop;
  Object.assign(swiper, {
    allowTouchMove: swiper.params.allowTouchMove,
    allowSlideNext: swiper.params.allowSlideNext,
    allowSlidePrev: swiper.params.allowSlidePrev
  });
  if (wasEnabled && !isEnabled) {
    swiper.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper.enable();
  }
  swiper.currentBreakpoint = breakpoint;
  swiper.emit("_beforeBreakpoint", breakpointParams);
  if (initialized) {
    if (needsReLoop) {
      swiper.loopDestroy();
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (!wasLoop && hasLoop) {
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (wasLoop && !hasLoop) {
      swiper.loopDestroy();
    }
  }
  swiper.emit("breakpoint", breakpointParams);
}
function getBreakpoint(breakpoints2, base, containerEl) {
  if (base === void 0) {
    base = "window";
  }
  if (!breakpoints2 || base === "container" && !containerEl) return void 0;
  let breakpoint = false;
  const window2 = getWindow();
  const currentHeight = base === "window" ? window2.innerHeight : containerEl.clientHeight;
  const points = Object.keys(breakpoints2).map((point) => {
    if (typeof point === "string" && point.indexOf("@") === 0) {
      const minRatio = parseFloat(point.substr(1));
      const value = currentHeight * minRatio;
      return {
        value,
        point
      };
    }
    return {
      value: point,
      point
    };
  });
  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  for (let i = 0; i < points.length; i += 1) {
    const {
      point,
      value
    } = points[i];
    if (base === "window") {
      if (window2.matchMedia(`(min-width: ${value}px)`).matches) {
        breakpoint = point;
      }
    } else if (value <= containerEl.clientWidth) {
      breakpoint = point;
    }
  }
  return breakpoint || "max";
}
var breakpoints = {
  setBreakpoint,
  getBreakpoint
};
function prepareClasses(entries, prefix) {
  const resultClasses = [];
  entries.forEach((item) => {
    if (typeof item === "object") {
      Object.keys(item).forEach((classNames) => {
        if (item[classNames]) {
          resultClasses.push(prefix + classNames);
        }
      });
    } else if (typeof item === "string") {
      resultClasses.push(prefix + item);
    }
  });
  return resultClasses;
}
function addClasses() {
  const swiper = this;
  const {
    classNames,
    params,
    rtl,
    el,
    device
  } = swiper;
  const suffixes = prepareClasses(["initialized", params.direction, {
    "free-mode": swiper.params.freeMode && params.freeMode.enabled
  }, {
    "autoheight": params.autoHeight
  }, {
    "rtl": rtl
  }, {
    "grid": params.grid && params.grid.rows > 1
  }, {
    "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
  }, {
    "android": device.android
  }, {
    "ios": device.ios
  }, {
    "css-mode": params.cssMode
  }, {
    "centered": params.cssMode && params.centeredSlides
  }, {
    "watch-progress": params.watchSlidesProgress
  }], params.containerModifierClass);
  classNames.push(...suffixes);
  el.classList.add(...classNames);
  swiper.emitContainerClasses();
}
function removeClasses() {
  const swiper = this;
  const {
    el,
    classNames
  } = swiper;
  if (!el || typeof el === "string") return;
  el.classList.remove(...classNames);
  swiper.emitContainerClasses();
}
var classes = {
  addClasses,
  removeClasses
};
function checkOverflow() {
  const swiper = this;
  const {
    isLocked: wasLocked,
    params
  } = swiper;
  const {
    slidesOffsetBefore
  } = params;
  if (slidesOffsetBefore) {
    const lastSlideIndex = swiper.slides.length - 1;
    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
    swiper.isLocked = swiper.size > lastSlideRightEdge;
  } else {
    swiper.isLocked = swiper.snapGrid.length === 1;
  }
  if (params.allowSlideNext === true) {
    swiper.allowSlideNext = !swiper.isLocked;
  }
  if (params.allowSlidePrev === true) {
    swiper.allowSlidePrev = !swiper.isLocked;
  }
  if (wasLocked && wasLocked !== swiper.isLocked) {
    swiper.isEnd = false;
  }
  if (wasLocked !== swiper.isLocked) {
    swiper.emit(swiper.isLocked ? "lock" : "unlock");
  }
}
var checkOverflow$1 = {
  checkOverflow
};
var defaults = {
  init: true,
  direction: "horizontal",
  oneWayMovement: false,
  swiperElementNodeName: "SWIPER-CONTAINER",
  touchEventsTarget: "wrapper",
  initialSlide: 0,
  speed: 300,
  cssMode: false,
  updateOnWindowResize: true,
  resizeObserver: true,
  nested: false,
  createElements: false,
  eventsPrefix: "swiper",
  enabled: true,
  focusableElements: "input, select, option, textarea, button, video, label",
  // Overrides
  width: null,
  height: null,
  //
  preventInteractionOnTransition: false,
  // ssr
  userAgent: null,
  url: null,
  // To support iOS's swipe-to-go-back gesture (when being used in-app).
  edgeSwipeDetection: false,
  edgeSwipeThreshold: 20,
  // Autoheight
  autoHeight: false,
  // Set wrapper width
  setWrapperSize: false,
  // Virtual Translate
  virtualTranslate: false,
  // Effects
  effect: "slide",
  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
  // Breakpoints
  breakpoints: void 0,
  breakpointsBase: "window",
  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerGroupSkip: 0,
  slidesPerGroupAuto: false,
  centeredSlides: false,
  centeredSlidesBounds: false,
  slidesOffsetBefore: 0,
  // in px
  slidesOffsetAfter: 0,
  // in px
  normalizeSlideIndex: true,
  centerInsufficientSlides: false,
  // Disable swiper and hide navigation when container not overflow
  watchOverflow: true,
  // Round length
  roundLengths: false,
  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchMoveStopPropagation: false,
  touchStartPreventDefault: true,
  touchStartForcePreventDefault: false,
  touchReleaseOnEdges: false,
  // Unique Navigation Elements
  uniqueNavElements: true,
  // Resistance
  resistance: true,
  resistanceRatio: 0.85,
  // Progress
  watchSlidesProgress: false,
  // Cursor
  grabCursor: false,
  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,
  // loop
  loop: false,
  loopAddBlankSlides: true,
  loopAdditionalSlides: 0,
  loopPreventsSliding: true,
  // rewind
  rewind: false,
  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null,
  // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: "swiper-no-swiping",
  noSwipingSelector: null,
  // Passive Listeners
  passiveListeners: true,
  maxBackfaceHiddenSlides: 10,
  // NS
  containerModifierClass: "swiper-",
  // NEW
  slideClass: "swiper-slide",
  slideBlankClass: "swiper-slide-blank",
  slideActiveClass: "swiper-slide-active",
  slideVisibleClass: "swiper-slide-visible",
  slideFullyVisibleClass: "swiper-slide-fully-visible",
  slideNextClass: "swiper-slide-next",
  slidePrevClass: "swiper-slide-prev",
  wrapperClass: "swiper-wrapper",
  lazyPreloaderClass: "swiper-lazy-preloader",
  lazyPreloadPrevNext: 0,
  // Callbacks
  runCallbacksOnInit: true,
  // Internals
  _emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
  return function extendParams(obj) {
    if (obj === void 0) {
      obj = {};
    }
    const moduleParamName = Object.keys(obj)[0];
    const moduleParams = obj[moduleParamName];
    if (typeof moduleParams !== "object" || moduleParams === null) {
      extend(allModulesParams, obj);
      return;
    }
    if (params[moduleParamName] === true) {
      params[moduleParamName] = {
        enabled: true
      };
    }
    if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
      params[moduleParamName].auto = true;
    }
    if (["pagination", "scrollbar"].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
      params[moduleParamName].auto = true;
    }
    if (!(moduleParamName in params && "enabled" in moduleParams)) {
      extend(allModulesParams, obj);
      return;
    }
    if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) {
      params[moduleParamName].enabled = true;
    }
    if (!params[moduleParamName]) params[moduleParamName] = {
      enabled: false
    };
    extend(allModulesParams, obj);
  };
}
const prototypes = {
  eventsEmitter,
  update,
  translate,
  transition,
  slide,
  loop,
  grabCursor,
  events: events$1,
  breakpoints,
  checkOverflow: checkOverflow$1,
  classes
};
const extendedDefaults = {};
class Swiper {
  constructor() {
    let el;
    let params;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") {
      params = args[0];
    } else {
      [el, params] = args;
    }
    if (!params) params = {};
    params = extend({}, params);
    if (el && !params.el) params.el = el;
    const document2 = getDocument();
    if (params.el && typeof params.el === "string" && document2.querySelectorAll(params.el).length > 1) {
      const swipers = [];
      document2.querySelectorAll(params.el).forEach((containerEl) => {
        const newParams = extend({}, params, {
          el: containerEl
        });
        swipers.push(new Swiper(newParams));
      });
      return swipers;
    }
    const swiper = this;
    swiper.__swiper__ = true;
    swiper.support = getSupport();
    swiper.device = getDevice({
      userAgent: params.userAgent
    });
    swiper.browser = getBrowser();
    swiper.eventsListeners = {};
    swiper.eventsAnyListeners = [];
    swiper.modules = [...swiper.__modules__];
    if (params.modules && Array.isArray(params.modules)) {
      swiper.modules.push(...params.modules);
    }
    const allModulesParams = {};
    swiper.modules.forEach((mod) => {
      mod({
        params,
        swiper,
        extendParams: moduleExtendParams(params, allModulesParams),
        on: swiper.on.bind(swiper),
        once: swiper.once.bind(swiper),
        off: swiper.off.bind(swiper),
        emit: swiper.emit.bind(swiper)
      });
    });
    const swiperParams = extend({}, defaults, allModulesParams);
    swiper.params = extend({}, swiperParams, extendedDefaults, params);
    swiper.originalParams = extend({}, swiper.params);
    swiper.passedParams = extend({}, params);
    if (swiper.params && swiper.params.on) {
      Object.keys(swiper.params.on).forEach((eventName) => {
        swiper.on(eventName, swiper.params.on[eventName]);
      });
    }
    if (swiper.params && swiper.params.onAny) {
      swiper.onAny(swiper.params.onAny);
    }
    Object.assign(swiper, {
      enabled: swiper.params.enabled,
      el,
      // Classes
      classNames: [],
      // Slides
      slides: [],
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],
      // isDirection
      isHorizontal() {
        return swiper.params.direction === "horizontal";
      },
      isVertical() {
        return swiper.params.direction === "vertical";
      },
      // Indexes
      activeIndex: 0,
      realIndex: 0,
      //
      isBeginning: true,
      isEnd: false,
      // Props
      translate: 0,
      previousTranslate: 0,
      progress: 0,
      velocity: 0,
      animating: false,
      cssOverflowAdjustment() {
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
      },
      // Locks
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,
      // Touch Events
      touchEventsData: {
        isTouched: void 0,
        isMoved: void 0,
        allowTouchCallbacks: void 0,
        touchStartTime: void 0,
        isScrolling: void 0,
        currentTranslate: void 0,
        startTranslate: void 0,
        allowThresholdMove: void 0,
        // Form elements to match
        focusableElements: swiper.params.focusableElements,
        // Last click time
        lastClickTime: 0,
        clickTimeout: void 0,
        // Velocities
        velocities: [],
        allowMomentumBounce: void 0,
        startMoving: void 0,
        pointerId: null,
        touchId: null
      },
      // Clicks
      allowClick: true,
      // Touches
      allowTouchMove: swiper.params.allowTouchMove,
      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      },
      // Images
      imagesToLoad: [],
      imagesLoaded: 0
    });
    swiper.emit("_swiper");
    if (swiper.params.init) {
      swiper.init();
    }
    return swiper;
  }
  getDirectionLabel(property) {
    if (this.isHorizontal()) {
      return property;
    }
    return {
      "width": "height",
      "margin-top": "margin-left",
      "margin-bottom ": "margin-right",
      "margin-left": "margin-top",
      "margin-right": "margin-bottom",
      "padding-left": "padding-top",
      "padding-right": "padding-bottom",
      "marginRight": "marginBottom"
    }[property];
  }
  getSlideIndex(slideEl) {
    const {
      slidesEl,
      params
    } = this;
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const firstSlideIndex = elementIndex(slides[0]);
    return elementIndex(slideEl) - firstSlideIndex;
  }
  getSlideIndexByData(index) {
    return this.getSlideIndex(this.slides.find((slideEl) => slideEl.getAttribute("data-swiper-slide-index") * 1 === index));
  }
  recalcSlides() {
    const swiper = this;
    const {
      slidesEl,
      params
    } = swiper;
    swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
  }
  enable() {
    const swiper = this;
    if (swiper.enabled) return;
    swiper.enabled = true;
    if (swiper.params.grabCursor) {
      swiper.setGrabCursor();
    }
    swiper.emit("enable");
  }
  disable() {
    const swiper = this;
    if (!swiper.enabled) return;
    swiper.enabled = false;
    if (swiper.params.grabCursor) {
      swiper.unsetGrabCursor();
    }
    swiper.emit("disable");
  }
  setProgress(progress, speed) {
    const swiper = this;
    progress = Math.min(Math.max(progress, 0), 1);
    const min = swiper.minTranslate();
    const max = swiper.maxTranslate();
    const current = (max - min) * progress + min;
    swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  emitContainerClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const cls = swiper.el.className.split(" ").filter((className) => {
      return className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
    });
    swiper.emit("_containerClasses", cls.join(" "));
  }
  getSlideClasses(slideEl) {
    const swiper = this;
    if (swiper.destroyed) return "";
    return slideEl.className.split(" ").filter((className) => {
      return className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0;
    }).join(" ");
  }
  emitSlidesClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const updates = [];
    swiper.slides.forEach((slideEl) => {
      const classNames = swiper.getSlideClasses(slideEl);
      updates.push({
        slideEl,
        classNames
      });
      swiper.emit("_slideClass", slideEl, classNames);
    });
    swiper.emit("_slideClasses", updates);
  }
  slidesPerViewDynamic(view, exact) {
    if (view === void 0) {
      view = "current";
    }
    if (exact === void 0) {
      exact = false;
    }
    const swiper = this;
    const {
      params,
      slides,
      slidesGrid,
      slidesSizesGrid,
      size: swiperSize,
      activeIndex
    } = swiper;
    let spv = 1;
    if (typeof params.slidesPerView === "number") return params.slidesPerView;
    if (params.centeredSlides) {
      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
      let breakLoop;
      for (let i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += Math.ceil(slides[i].swiperSlideSize);
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
      for (let i = activeIndex - 1; i >= 0; i -= 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
    } else {
      if (view === "current") {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
    }
    return spv;
  }
  update() {
    const swiper = this;
    if (!swiper || swiper.destroyed) return;
    const {
      snapGrid,
      params
    } = swiper;
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }
    [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      }
    });
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateProgress();
    swiper.updateSlidesClasses();
    function setTranslate2() {
      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    let translated;
    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
      setTranslate2();
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
        const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
        translated = swiper.slideTo(slides.length - 1, 0, false, true);
      } else {
        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate2();
      }
    }
    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
      swiper.checkOverflow();
    }
    swiper.emit("update");
  }
  changeDirection(newDirection, needUpdate) {
    if (needUpdate === void 0) {
      needUpdate = true;
    }
    const swiper = this;
    const currentDirection = swiper.params.direction;
    if (!newDirection) {
      newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
    }
    if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") {
      return swiper;
    }
    swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
    swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
    swiper.emitContainerClasses();
    swiper.params.direction = newDirection;
    swiper.slides.forEach((slideEl) => {
      if (newDirection === "vertical") {
        slideEl.style.width = "";
      } else {
        slideEl.style.height = "";
      }
    });
    swiper.emit("changeDirection");
    if (needUpdate) swiper.update();
    return swiper;
  }
  changeLanguageDirection(direction) {
    const swiper = this;
    if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
    swiper.rtl = direction === "rtl";
    swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
    if (swiper.rtl) {
      swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "rtl";
    } else {
      swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = "ltr";
    }
    swiper.update();
  }
  mount(element) {
    const swiper = this;
    if (swiper.mounted) return true;
    let el = element || swiper.params.el;
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    if (!el) {
      return false;
    }
    el.swiper = swiper;
    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
      swiper.isElement = true;
    }
    const getWrapperSelector = () => {
      return `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
    };
    const getWrapper = () => {
      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
        const res = el.shadowRoot.querySelector(getWrapperSelector());
        return res;
      }
      return elementChildren(el, getWrapperSelector())[0];
    };
    let wrapperEl = getWrapper();
    if (!wrapperEl && swiper.params.createElements) {
      wrapperEl = createElement("div", swiper.params.wrapperClass);
      el.append(wrapperEl);
      elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl) => {
        wrapperEl.append(slideEl);
      });
    }
    Object.assign(swiper, {
      el,
      wrapperEl,
      slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
      hostEl: swiper.isElement ? el.parentNode.host : el,
      mounted: true,
      // RTL
      rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
      rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
      wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
    });
    return true;
  }
  init(el) {
    const swiper = this;
    if (swiper.initialized) return swiper;
    const mounted = swiper.mount(el);
    if (mounted === false) return swiper;
    swiper.emit("beforeInit");
    if (swiper.params.breakpoints) {
      swiper.setBreakpoint();
    }
    swiper.addClasses();
    swiper.updateSize();
    swiper.updateSlides();
    if (swiper.params.watchOverflow) {
      swiper.checkOverflow();
    }
    if (swiper.params.grabCursor && swiper.enabled) {
      swiper.setGrabCursor();
    }
    if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
      swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
    } else {
      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
    }
    if (swiper.params.loop) {
      swiper.loopCreate(void 0, true);
    }
    swiper.attachEvents();
    const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
    if (swiper.isElement) {
      lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
    }
    lazyElements.forEach((imageEl) => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      } else {
        imageEl.addEventListener("load", (e) => {
          processLazyPreloader(swiper, e.target);
        });
      }
    });
    preload(swiper);
    swiper.initialized = true;
    preload(swiper);
    swiper.emit("init");
    swiper.emit("afterInit");
    return swiper;
  }
  destroy(deleteInstance, cleanStyles) {
    if (deleteInstance === void 0) {
      deleteInstance = true;
    }
    if (cleanStyles === void 0) {
      cleanStyles = true;
    }
    const swiper = this;
    const {
      params,
      el,
      wrapperEl,
      slides
    } = swiper;
    if (typeof swiper.params === "undefined" || swiper.destroyed) {
      return null;
    }
    swiper.emit("beforeDestroy");
    swiper.initialized = false;
    swiper.detachEvents();
    if (params.loop) {
      swiper.loopDestroy();
    }
    if (cleanStyles) {
      swiper.removeClasses();
      if (el && typeof el !== "string") {
        el.removeAttribute("style");
      }
      if (wrapperEl) {
        wrapperEl.removeAttribute("style");
      }
      if (slides && slides.length) {
        slides.forEach((slideEl) => {
          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
          slideEl.removeAttribute("style");
          slideEl.removeAttribute("data-swiper-slide-index");
        });
      }
    }
    swiper.emit("destroy");
    Object.keys(swiper.eventsListeners).forEach((eventName) => {
      swiper.off(eventName);
    });
    if (deleteInstance !== false) {
      if (swiper.el && typeof swiper.el !== "string") {
        swiper.el.swiper = null;
      }
      deleteProps(swiper);
    }
    swiper.destroyed = true;
    return null;
  }
  static extendDefaults(newDefaults) {
    extend(extendedDefaults, newDefaults);
  }
  static get extendedDefaults() {
    return extendedDefaults;
  }
  static get defaults() {
    return defaults;
  }
  static installModule(mod) {
    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
    const modules = Swiper.prototype.__modules__;
    if (typeof mod === "function" && modules.indexOf(mod) < 0) {
      modules.push(mod);
    }
  }
  static use(module) {
    if (Array.isArray(module)) {
      module.forEach((m) => Swiper.installModule(m));
      return Swiper;
    }
    Swiper.installModule(module);
    return Swiper;
  }
}
Object.keys(prototypes).forEach((prototypeGroup) => {
  Object.keys(prototypes[prototypeGroup]).forEach((protoMethod) => {
    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
  });
});
Swiper.use([Resize, Observer]);
function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach((key) => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement("div", checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}
function classesToSelector(classes2) {
  if (classes2 === void 0) {
    classes2 = "";
  }
  return `.${classes2.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
}
function Scrollbar(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const document2 = getDocument();
  let isTouched = false;
  let timeout = null;
  let dragTimeout = null;
  let dragStartPos;
  let dragSize;
  let trackSize;
  let divider;
  extendParams({
    scrollbar: {
      el: null,
      dragSize: "auto",
      hide: false,
      draggable: false,
      snapOnRelease: true,
      lockClass: "swiper-scrollbar-lock",
      dragClass: "swiper-scrollbar-drag",
      scrollbarDisabledClass: "swiper-scrollbar-disabled",
      horizontalClass: `swiper-scrollbar-horizontal`,
      verticalClass: `swiper-scrollbar-vertical`
    }
  });
  swiper.scrollbar = {
    el: null,
    dragEl: null
  };
  function setTranslate2() {
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
    const {
      scrollbar,
      rtlTranslate: rtl
    } = swiper;
    const {
      dragEl,
      el
    } = scrollbar;
    const params = swiper.params.scrollbar;
    const progress = swiper.params.loop ? swiper.progressLoop : swiper.progress;
    let newSize = dragSize;
    let newPos = (trackSize - dragSize) * progress;
    if (rtl) {
      newPos = -newPos;
      if (newPos > 0) {
        newSize = dragSize - newPos;
        newPos = 0;
      } else if (-newPos + dragSize > trackSize) {
        newSize = trackSize + newPos;
      }
    } else if (newPos < 0) {
      newSize = dragSize + newPos;
      newPos = 0;
    } else if (newPos + dragSize > trackSize) {
      newSize = trackSize - newPos;
    }
    if (swiper.isHorizontal()) {
      dragEl.style.transform = `translate3d(${newPos}px, 0, 0)`;
      dragEl.style.width = `${newSize}px`;
    } else {
      dragEl.style.transform = `translate3d(0px, ${newPos}px, 0)`;
      dragEl.style.height = `${newSize}px`;
    }
    if (params.hide) {
      clearTimeout(timeout);
      el.style.opacity = 1;
      timeout = setTimeout(() => {
        el.style.opacity = 0;
        el.style.transitionDuration = "400ms";
      }, 1e3);
    }
  }
  function setTransition2(duration) {
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
    swiper.scrollbar.dragEl.style.transitionDuration = `${duration}ms`;
  }
  function updateSize2() {
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
    const {
      scrollbar
    } = swiper;
    const {
      dragEl,
      el
    } = scrollbar;
    dragEl.style.width = "";
    dragEl.style.height = "";
    trackSize = swiper.isHorizontal() ? el.offsetWidth : el.offsetHeight;
    divider = swiper.size / (swiper.virtualSize + swiper.params.slidesOffsetBefore - (swiper.params.centeredSlides ? swiper.snapGrid[0] : 0));
    if (swiper.params.scrollbar.dragSize === "auto") {
      dragSize = trackSize * divider;
    } else {
      dragSize = parseInt(swiper.params.scrollbar.dragSize, 10);
    }
    if (swiper.isHorizontal()) {
      dragEl.style.width = `${dragSize}px`;
    } else {
      dragEl.style.height = `${dragSize}px`;
    }
    if (divider >= 1) {
      el.style.display = "none";
    } else {
      el.style.display = "";
    }
    if (swiper.params.scrollbar.hide) {
      el.style.opacity = 0;
    }
    if (swiper.params.watchOverflow && swiper.enabled) {
      scrollbar.el.classList[swiper.isLocked ? "add" : "remove"](swiper.params.scrollbar.lockClass);
    }
  }
  function getPointerPosition(e) {
    return swiper.isHorizontal() ? e.clientX : e.clientY;
  }
  function setDragPosition(e) {
    const {
      scrollbar,
      rtlTranslate: rtl
    } = swiper;
    const {
      el
    } = scrollbar;
    let positionRatio;
    positionRatio = (getPointerPosition(e) - elementOffset(el)[swiper.isHorizontal() ? "left" : "top"] - (dragStartPos !== null ? dragStartPos : dragSize / 2)) / (trackSize - dragSize);
    positionRatio = Math.max(Math.min(positionRatio, 1), 0);
    if (rtl) {
      positionRatio = 1 - positionRatio;
    }
    const position = swiper.minTranslate() + (swiper.maxTranslate() - swiper.minTranslate()) * positionRatio;
    swiper.updateProgress(position);
    swiper.setTranslate(position);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  function onDragStart(e) {
    const params = swiper.params.scrollbar;
    const {
      scrollbar,
      wrapperEl
    } = swiper;
    const {
      el,
      dragEl
    } = scrollbar;
    isTouched = true;
    dragStartPos = e.target === dragEl ? getPointerPosition(e) - e.target.getBoundingClientRect()[swiper.isHorizontal() ? "left" : "top"] : null;
    e.preventDefault();
    e.stopPropagation();
    wrapperEl.style.transitionDuration = "100ms";
    dragEl.style.transitionDuration = "100ms";
    setDragPosition(e);
    clearTimeout(dragTimeout);
    el.style.transitionDuration = "0ms";
    if (params.hide) {
      el.style.opacity = 1;
    }
    if (swiper.params.cssMode) {
      swiper.wrapperEl.style["scroll-snap-type"] = "none";
    }
    emit("scrollbarDragStart", e);
  }
  function onDragMove(e) {
    const {
      scrollbar,
      wrapperEl
    } = swiper;
    const {
      el,
      dragEl
    } = scrollbar;
    if (!isTouched) return;
    if (e.preventDefault && e.cancelable) e.preventDefault();
    else e.returnValue = false;
    setDragPosition(e);
    wrapperEl.style.transitionDuration = "0ms";
    el.style.transitionDuration = "0ms";
    dragEl.style.transitionDuration = "0ms";
    emit("scrollbarDragMove", e);
  }
  function onDragEnd(e) {
    const params = swiper.params.scrollbar;
    const {
      scrollbar,
      wrapperEl
    } = swiper;
    const {
      el
    } = scrollbar;
    if (!isTouched) return;
    isTouched = false;
    if (swiper.params.cssMode) {
      swiper.wrapperEl.style["scroll-snap-type"] = "";
      wrapperEl.style.transitionDuration = "";
    }
    if (params.hide) {
      clearTimeout(dragTimeout);
      dragTimeout = nextTick(() => {
        el.style.opacity = 0;
        el.style.transitionDuration = "400ms";
      }, 1e3);
    }
    emit("scrollbarDragEnd", e);
    if (params.snapOnRelease) {
      swiper.slideToClosest();
    }
  }
  function events2(method) {
    const {
      scrollbar,
      params
    } = swiper;
    const el = scrollbar.el;
    if (!el) return;
    const target = el;
    const activeListener = params.passiveListeners ? {
      passive: false,
      capture: false
    } : false;
    const passiveListener = params.passiveListeners ? {
      passive: true,
      capture: false
    } : false;
    if (!target) return;
    const eventMethod = method === "on" ? "addEventListener" : "removeEventListener";
    target[eventMethod]("pointerdown", onDragStart, activeListener);
    document2[eventMethod]("pointermove", onDragMove, activeListener);
    document2[eventMethod]("pointerup", onDragEnd, passiveListener);
  }
  function enableDraggable() {
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
    events2("on");
  }
  function disableDraggable() {
    if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
    events2("off");
  }
  function init() {
    const {
      scrollbar,
      el: swiperEl
    } = swiper;
    swiper.params.scrollbar = createElementIfNotDefined(swiper, swiper.originalParams.scrollbar, swiper.params.scrollbar, {
      el: "swiper-scrollbar"
    });
    const params = swiper.params.scrollbar;
    if (!params.el) return;
    let el;
    if (typeof params.el === "string" && swiper.isElement) {
      el = swiper.el.querySelector(params.el);
    }
    if (!el && typeof params.el === "string") {
      el = document2.querySelectorAll(params.el);
      if (!el.length) return;
    } else if (!el) {
      el = params.el;
    }
    if (swiper.params.uniqueNavElements && typeof params.el === "string" && el.length > 1 && swiperEl.querySelectorAll(params.el).length === 1) {
      el = swiperEl.querySelector(params.el);
    }
    if (el.length > 0) el = el[0];
    el.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    let dragEl;
    if (el) {
      dragEl = el.querySelector(classesToSelector(swiper.params.scrollbar.dragClass));
      if (!dragEl) {
        dragEl = createElement("div", swiper.params.scrollbar.dragClass);
        el.append(dragEl);
      }
    }
    Object.assign(scrollbar, {
      el,
      dragEl
    });
    if (params.draggable) {
      enableDraggable();
    }
    if (el) {
      el.classList[swiper.enabled ? "remove" : "add"](...classesToTokens(swiper.params.scrollbar.lockClass));
    }
  }
  function destroy() {
    const params = swiper.params.scrollbar;
    const el = swiper.scrollbar.el;
    if (el) {
      el.classList.remove(...classesToTokens(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass));
    }
    disableDraggable();
  }
  on("changeDirection", () => {
    if (!swiper.scrollbar || !swiper.scrollbar.el) return;
    const params = swiper.params.scrollbar;
    let {
      el
    } = swiper.scrollbar;
    el = makeElementsArray(el);
    el.forEach((subEl) => {
      subEl.classList.remove(params.horizontalClass, params.verticalClass);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    });
  });
  on("init", () => {
    if (swiper.params.scrollbar.enabled === false) {
      disable();
    } else {
      init();
      updateSize2();
      setTranslate2();
    }
  });
  on("update resize observerUpdate lock unlock changeDirection", () => {
    updateSize2();
  });
  on("setTranslate", () => {
    setTranslate2();
  });
  on("setTransition", (_s, duration) => {
    setTransition2(duration);
  });
  on("enable disable", () => {
    const {
      el
    } = swiper.scrollbar;
    if (el) {
      el.classList[swiper.enabled ? "remove" : "add"](...classesToTokens(swiper.params.scrollbar.lockClass));
    }
  });
  on("destroy", () => {
    destroy();
  });
  const enable = () => {
    swiper.el.classList.remove(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
    if (swiper.scrollbar.el) {
      swiper.scrollbar.el.classList.remove(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
    }
    init();
    updateSize2();
    setTranslate2();
  };
  const disable = () => {
    swiper.el.classList.add(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
    if (swiper.scrollbar.el) {
      swiper.scrollbar.el.classList.add(...classesToTokens(swiper.params.scrollbar.scrollbarDisabledClass));
    }
    destroy();
  };
  Object.assign(swiper.scrollbar, {
    enable,
    disable,
    updateSize: updateSize2,
    setTranslate: setTranslate2,
    init,
    destroy
  });
}
function initSliders() {
  if (document.querySelector(".courses__slider")) {
    new Swiper(".courses__slider", {
      // <- Вказуємо склас потрібного слайдера
      // Підключаємо модулі слайдера
      // для конкретного випадку
      modules: [Scrollbar],
      observer: true,
      observeParents: true,
      // slidesPerView: 3,
      // spaceBetween: 16,
      //autoHeight: true,
      speed: 800,
      //touchRatio: 0,
      //simulateTouch: false,
      //loop: true,
      //preloadImages: false,
      //lazy: true,
      /*
      // Ефекти
      effect: 'fade',
      autoplay: {
      	delay: 3000,
      	disableOnInteraction: false,
      },
      */
      // Пагінація
      /*
      pagination: {
      	el: '.swiper-pagination',
      	clickable: true,
      },
      */
      // Скроллбар
      scrollbar: {
        el: ".swiper-scrollbar",
        draggable: true
      },
      // Брейкпоінти
      breakpoints: {
        360: {
          slidesPerView: 1.1,
          spaceBetween: 16
          // autoHeight: true,
        },
        500: {
          slidesPerView: 1.5,
          spaceBetween: 16
        },
        768: {
          slidesPerView: 2.3,
          spaceBetween: 16
        },
        992: {
          slidesPerView: 3,
          spaceBetween: 16
        }
      },
      // Події
      on: {}
    });
  }
  let advantagesSwiper;
  const advantagesSliderEl = document.querySelector(".advantages__slider");
  function toggleAdvantagesSlider() {
    if (advantagesSliderEl) {
      if (window.innerWidth <= 767.98 && !advantagesSwiper) {
        advantagesSwiper = new Swiper(advantagesSliderEl, {
          modules: [Scrollbar],
          observer: true,
          observeParents: true,
          speed: 800,
          scrollbar: {
            el: ".swiper-scrollbar",
            draggable: true
          },
          breakpoints: {
            360: {
              slidesPerView: 1.1,
              spaceBetween: 16
            },
            500: {
              slidesPerView: 2.3,
              spaceBetween: 16
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 16
            }
          }
        });
      } else if (window.innerWidth > 767.98 && advantagesSwiper) {
        advantagesSwiper.destroy(true, true);
        advantagesSwiper = null;
      }
    }
  }
  toggleAdvantagesSlider();
  window.addEventListener("resize", toggleAdvantagesSlider);
}
document.querySelector("[data-fls-slider]") ? window.addEventListener("load", initSliders) : null;
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
function headerScroll() {
  const header = document.querySelector("[data-fls-header-scroll]");
  const headerShow = header.hasAttribute("data-fls-header-scroll-show");
  const headerShowTimer = header.dataset.flsHeaderScrollShow ? header.dataset.flsHeaderScrollShow : 500;
  const startPoint = header.dataset.flsHeaderScroll ? header.dataset.flsHeaderScroll : 1;
  let scrollDirection = 0;
  let timer;
  document.addEventListener("scroll", function(e) {
    const scrollTop = window.scrollY;
    clearTimeout(timer);
    if (scrollTop >= startPoint) {
      !header.classList.contains("--header-scroll") ? header.classList.add("--header-scroll") : null;
      if (headerShow) {
        if (scrollTop > scrollDirection) {
          header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
        } else {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }
        timer = setTimeout(() => {
          !header.classList.contains("--header-show") ? header.classList.add("--header-show") : null;
        }, headerShowTimer);
      }
    } else {
      header.classList.contains("--header-scroll") ? header.classList.remove("--header-scroll") : null;
      if (headerShow) {
        header.classList.contains("--header-show") ? header.classList.remove("--header-show") : null;
      }
    }
    scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
  });
}
document.querySelector("[data-fls-header-scroll]") ? window.addEventListener("load", headerScroll) : null;
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
function pageNavigation() {
  document.addEventListener("click", pageNavigationAction);
  document.addEventListener("watcherCallback", pageNavigationAction);
  function pageNavigationAction(e) {
    if (e.type === "click") {
      const targetElement = e.target;
      if (targetElement.closest("[data-fls-scrollto]")) {
        const gotoLink = targetElement.closest("[data-fls-scrollto]");
        const gotoLinkSelector = gotoLink.dataset.flsScrollto ? gotoLink.dataset.flsScrollto : "";
        const noHeader = gotoLink.hasAttribute("data-fls-scrollto-header") ? true : false;
        const gotoSpeed = gotoLink.dataset.flsScrolltoSpeed ? gotoLink.dataset.flsScrolltoSpeed : 500;
        const offsetTop = gotoLink.dataset.flsScrolltoTop ? parseInt(gotoLink.dataset.flsScrolltoTop) : 0;
        if (window.fullpage) {
          const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fls-fullpage-section]");
          const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.flsFullpageId : null;
          if (fullpageSectionId !== null) {
            window.fullpage.switchingSection(fullpageSectionId);
            if (document.documentElement.hasAttribute("data-fls-menu-open")) {
              bodyUnlock();
              document.documentElement.removeAttribute("data-fls-menu-open");
            }
          }
        } else {
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
        }
        e.preventDefault();
      }
    } else if (e.type === "watcherCallback" && e.detail) {
      const entry = e.detail.entry;
      const targetElement = entry.target;
      if (targetElement.dataset.flsWatcher === "navigator") {
        document.querySelector(`[data-fls-scrollto].--navigator-active`);
        let navigatorCurrentItem;
        if (targetElement.id && document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`)) {
          navigatorCurrentItem = document.querySelector(`[data-fls-scrollto="#${targetElement.id}"]`);
        } else if (targetElement.classList.length) {
          for (let index = 0; index < targetElement.classList.length; index++) {
            const element = targetElement.classList[index];
            if (document.querySelector(`[data-fls-scrollto=".${element}"]`)) {
              navigatorCurrentItem = document.querySelector(`[data-fls-scrollto=".${element}"]`);
              break;
            }
          }
        }
        if (entry.isIntersecting) {
          navigatorCurrentItem ? navigatorCurrentItem.classList.add("--navigator-active") : null;
        } else {
          navigatorCurrentItem ? navigatorCurrentItem.classList.remove("--navigator-active") : null;
        }
      }
    }
  }
  if (getHash()) {
    let goToHash;
    if (document.querySelector(`#${getHash()}`)) {
      goToHash = `#${getHash()}`;
    } else if (document.querySelector(`.${getHash()}`)) {
      goToHash = `.${getHash()}`;
    }
    goToHash ? gotoBlock(goToHash) : null;
  }
}
document.querySelector("[data-fls-scrollto]") ? window.addEventListener("load", pageNavigation) : null;
const marquee = () => {
  const $marqueeArray = document.querySelectorAll("[data-fls-marquee]");
  const ATTR_NAMES = {
    inner: "data-fls-marquee-inner",
    item: "data-fls-marquee-item"
  };
  if (!$marqueeArray.length) return;
  const { head } = document;
  const debounce = (delay, fn) => {
    let timerId;
    return (...args) => {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn(...args);
        timerId = null;
      }, delay);
    };
  };
  const onWindowWidthResize = (cb) => {
    if (!cb && !isFunction(cb)) return;
    let prevWidth = 0;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (prevWidth !== currentWidth) {
        prevWidth = currentWidth;
        cb();
      }
    };
    window.addEventListener("resize", debounce(50, handleResize));
    handleResize();
  };
  const buildMarquee = (marqueeNode) => {
    if (!marqueeNode) return;
    const $marquee = marqueeNode;
    const $childElements = $marquee.children;
    if (!$childElements.length) return;
    Array.from($childElements).forEach(($childItem) => $childItem.setAttribute(ATTR_NAMES.item, ""));
    const htmlStructure = `<div ${ATTR_NAMES.inner}>${$marquee.innerHTML}</div>`;
    $marquee.innerHTML = htmlStructure;
  };
  const getElSize = ($el, isVertical) => {
    if (isVertical) return $el.offsetHeight;
    return $el.offsetWidth;
  };
  $marqueeArray.forEach(($wrapper) => {
    var _a;
    if (!$wrapper) return;
    buildMarquee($wrapper);
    const $marqueeInner = $wrapper.firstElementChild;
    let cacheArray = [];
    if (!$marqueeInner) return;
    const dataMarqueeSpace = parseFloat($wrapper.getAttribute("data-fls-marquee-space"));
    const $items = $wrapper.querySelectorAll(`[${ATTR_NAMES.item}]`);
    const speed = parseFloat($wrapper.getAttribute("data-fls-marquee-speed")) / 10 || 100;
    const isMousePaused = $wrapper.hasAttribute("data-fls-marquee-pause-mouse-enter");
    const direction = $wrapper.getAttribute("data-fls-marquee-direction");
    const isVertical = direction === "bottom" || direction === "top";
    const animName = `marqueeAnimation-${Math.floor(Math.random() * 1e7)}`;
    let spaceBetweenItem = parseFloat((_a = window.getComputedStyle($items[0])) == null ? void 0 : _a.getPropertyValue("margin-right"));
    let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
    let startPosition = parseFloat($wrapper.getAttribute("data-fls-marquee-start")) || 0;
    let sumSize = 0;
    let firstScreenVisibleSize = 0;
    let initialSizeElements = 0;
    let initialElementsLength = $marqueeInner.children.length;
    let index = 0;
    let counterDuplicateElements = 0;
    const initEvents = () => {
      if (startPosition) $marqueeInner.addEventListener("animationiteration", onChangeStartPosition);
      if (!isMousePaused) return;
      $marqueeInner.removeEventListener("mouseenter", onChangePaused);
      $marqueeInner.removeEventListener("mouseleave", onChangePaused);
      $marqueeInner.addEventListener("mouseenter", onChangePaused);
      $marqueeInner.addEventListener("mouseleave", onChangePaused);
    };
    const onChangeStartPosition = () => {
      startPosition = 0;
      $marqueeInner.removeEventListener("animationiteration", onChangeStartPosition);
      onResize2();
    };
    const setBaseStyles = (firstScreenVisibleSize2) => {
      let baseStyle = "display: flex; flex-wrap: nowrap;";
      if (isVertical) {
        baseStyle += `
				flex-direction: column;
				position: relative;
				will-change: transform;`;
        if (direction === "bottom") {
          baseStyle += `top: -${firstScreenVisibleSize2}px;`;
        }
      } else {
        baseStyle += `
				position: relative;
				will-change: transform;`;
        if (direction === "right") {
          baseStyle += `inset-inline-start: -${firstScreenVisibleSize2}px;;`;
        }
      }
      $marqueeInner.style.cssText = baseStyle;
    };
    const setdirectionAnim = (totalWidth) => {
      switch (direction) {
        case "right":
        case "bottom":
          return totalWidth;
        default:
          return -totalWidth;
      }
    };
    const animation = () => {
      const keyFrameCss = `@keyframes ${animName} {
					 0% {
						 transform: translate${isVertical ? "Y" : "X"}(${!isVertical && window.stateRtl ? -startPosition : startPosition}%);
					 }
					 100% {
						 transform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(
        !isVertical && window.stateRtl ? -firstScreenVisibleSize : firstScreenVisibleSize
      )}px);
					 }
				 }`;
      const $style = document.createElement("style");
      $style.classList.add(animName);
      $style.innerHTML = keyFrameCss;
      head.append($style);
      $marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + startPosition * firstScreenVisibleSize / 100) / speed}s infinite linear`;
    };
    const addDublicateElements = () => {
      sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;
      const $parentNodeWidth = getElSize($wrapper, isVertical);
      let $childrenEl = Array.from($marqueeInner.children);
      if (!$childrenEl.length) return;
      if (!cacheArray.length) {
        cacheArray = $childrenEl.map(($item) => $item);
      } else {
        $childrenEl = [...cacheArray];
      }
      $marqueeInner.style.display = "flex";
      if (isVertical) $marqueeInner.style.flexDirection = "column";
      $marqueeInner.innerHTML = "";
      $childrenEl.forEach(($item) => {
        $marqueeInner.append($item);
      });
      $childrenEl.forEach(($item) => {
        if (isVertical) {
          $item.style.marginBottom = `${spaceBetween}px`;
        } else {
          $item.style.marginRight = `${spaceBetween}px`;
          $item.style.flexShrink = 0;
        }
        const sizeEl = getElSize($item, isVertical);
        sumSize += sizeEl + spaceBetween;
        firstScreenVisibleSize += sizeEl + spaceBetween;
        initialSizeElements += sizeEl + spaceBetween;
        counterDuplicateElements += 1;
        return sizeEl;
      });
      const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;
      for (; sumSize < $multiplyWidth; index += 1) {
        if (!$childrenEl[index]) index = 0;
        const $cloneNone = $childrenEl[index].cloneNode(true);
        const $lastElement = $marqueeInner.children[index];
        $marqueeInner.append($cloneNone);
        sumSize += getElSize($lastElement, isVertical) + spaceBetween;
        if (firstScreenVisibleSize < $parentNodeWidth || counterDuplicateElements % initialElementsLength !== 0) {
          counterDuplicateElements += 1;
          firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
        }
      }
      setBaseStyles(firstScreenVisibleSize);
    };
    const correctSpaceBetween = () => {
      if (spaceBetweenItem) {
        $items.forEach(($item) => $item.style.removeProperty("margin-right"));
        spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue("margin-right"));
        spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
      }
    };
    const init = () => {
      correctSpaceBetween();
      addDublicateElements();
      animation();
      initEvents();
    };
    const onResize2 = () => {
      var _a2;
      (_a2 = head.querySelector(`.${animName}`)) == null ? void 0 : _a2.remove();
      init();
    };
    const onChangePaused = (e) => {
      const { type, target } = e;
      target.style.animationPlayState = type === "mouseenter" ? "paused" : "running";
    };
    onWindowWidthResize(onResize2);
  });
};
marquee();
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var intlTelInput$1 = { exports: {} };
var hasRequiredIntlTelInput;
function requireIntlTelInput() {
  if (hasRequiredIntlTelInput) return intlTelInput$1.exports;
  hasRequiredIntlTelInput = 1;
  (function(module) {
    (function(factory) {
      if (module.exports) {
        module.exports = factory();
      } else {
        window.intlTelInput = factory();
      }
    })(() => {
      var factoryOutput = (() => {
        var __defProp = Object.defineProperty;
        var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
        var __getOwnPropNames = Object.getOwnPropertyNames;
        var __hasOwnProp = Object.prototype.hasOwnProperty;
        var __export = (target, all) => {
          for (var name in all)
            __defProp(target, name, { get: all[name], enumerable: true });
        };
        var __copyProps = (to, from, except, desc) => {
          if (from && typeof from === "object" || typeof from === "function") {
            for (let key of __getOwnPropNames(from))
              if (!__hasOwnProp.call(to, key) && key !== except)
                __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
          }
          return to;
        };
        var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
        var intl_tel_input_exports = {};
        __export(intl_tel_input_exports, {
          Iti: () => Iti,
          default: () => intl_tel_input_default
        });
        var rawCountryData = [
          [
            "af",
            // Afghanistan
            "93"
          ],
          [
            "ax",
            // Åland Islands
            "358",
            1
          ],
          [
            "al",
            // Albania
            "355"
          ],
          [
            "dz",
            // Algeria
            "213"
          ],
          [
            "as",
            // American Samoa
            "1",
            5,
            ["684"]
          ],
          [
            "ad",
            // Andorra
            "376"
          ],
          [
            "ao",
            // Angola
            "244"
          ],
          [
            "ai",
            // Anguilla
            "1",
            6,
            ["264"]
          ],
          [
            "ag",
            // Antigua and Barbuda
            "1",
            7,
            ["268"]
          ],
          [
            "ar",
            // Argentina
            "54"
          ],
          [
            "am",
            // Armenia
            "374"
          ],
          [
            "aw",
            // Aruba
            "297"
          ],
          [
            "ac",
            // Ascension Island
            "247"
          ],
          [
            "au",
            // Australia
            "61",
            0,
            null,
            "0"
          ],
          [
            "at",
            // Austria
            "43"
          ],
          [
            "az",
            // Azerbaijan
            "994"
          ],
          [
            "bs",
            // Bahamas
            "1",
            8,
            ["242"]
          ],
          [
            "bh",
            // Bahrain
            "973"
          ],
          [
            "bd",
            // Bangladesh
            "880"
          ],
          [
            "bb",
            // Barbados
            "1",
            9,
            ["246"]
          ],
          [
            "by",
            // Belarus
            "375"
          ],
          [
            "be",
            // Belgium
            "32"
          ],
          [
            "bz",
            // Belize
            "501"
          ],
          [
            "bj",
            // Benin
            "229"
          ],
          [
            "bm",
            // Bermuda
            "1",
            10,
            ["441"]
          ],
          [
            "bt",
            // Bhutan
            "975"
          ],
          [
            "bo",
            // Bolivia
            "591"
          ],
          [
            "ba",
            // Bosnia and Herzegovina
            "387"
          ],
          [
            "bw",
            // Botswana
            "267"
          ],
          [
            "br",
            // Brazil
            "55"
          ],
          [
            "io",
            // British Indian Ocean Territory
            "246"
          ],
          [
            "vg",
            // British Virgin Islands
            "1",
            11,
            ["284"]
          ],
          [
            "bn",
            // Brunei
            "673"
          ],
          [
            "bg",
            // Bulgaria
            "359"
          ],
          [
            "bf",
            // Burkina Faso
            "226"
          ],
          [
            "bi",
            // Burundi
            "257"
          ],
          [
            "kh",
            // Cambodia
            "855"
          ],
          [
            "cm",
            // Cameroon
            "237"
          ],
          [
            "ca",
            // Canada
            "1",
            1,
            ["204", "226", "236", "249", "250", "263", "289", "306", "343", "354", "365", "367", "368", "382", "387", "403", "416", "418", "428", "431", "437", "438", "450", "584", "468", "474", "506", "514", "519", "548", "579", "581", "584", "587", "604", "613", "639", "647", "672", "683", "705", "709", "742", "753", "778", "780", "782", "807", "819", "825", "867", "873", "879", "902", "905"]
          ],
          [
            "cv",
            // Cape Verde
            "238"
          ],
          [
            "bq",
            // Caribbean Netherlands
            "599",
            1,
            ["3", "4", "7"]
          ],
          [
            "ky",
            // Cayman Islands
            "1",
            12,
            ["345"]
          ],
          [
            "cf",
            // Central African Republic
            "236"
          ],
          [
            "td",
            // Chad
            "235"
          ],
          [
            "cl",
            // Chile
            "56"
          ],
          [
            "cn",
            // China
            "86"
          ],
          [
            "cx",
            // Christmas Island
            "61",
            2,
            ["89164"],
            "0"
          ],
          [
            "cc",
            // Cocos (Keeling) Islands
            "61",
            1,
            ["89162"],
            "0"
          ],
          [
            "co",
            // Colombia
            "57"
          ],
          [
            "km",
            // Comoros
            "269"
          ],
          [
            "cg",
            // Congo (Brazzaville)
            "242"
          ],
          [
            "cd",
            // Congo (Kinshasa)
            "243"
          ],
          [
            "ck",
            // Cook Islands
            "682"
          ],
          [
            "cr",
            // Costa Rica
            "506"
          ],
          [
            "ci",
            // Côte d'Ivoire
            "225"
          ],
          [
            "hr",
            // Croatia
            "385"
          ],
          [
            "cu",
            // Cuba
            "53"
          ],
          [
            "cw",
            // Curaçao
            "599",
            0
          ],
          [
            "cy",
            // Cyprus
            "357"
          ],
          [
            "cz",
            // Czech Republic
            "420"
          ],
          [
            "dk",
            // Denmark
            "45"
          ],
          [
            "dj",
            // Djibouti
            "253"
          ],
          [
            "dm",
            // Dominica
            "1",
            13,
            ["767"]
          ],
          [
            "do",
            // Dominican Republic
            "1",
            2,
            ["809", "829", "849"]
          ],
          [
            "ec",
            // Ecuador
            "593"
          ],
          [
            "eg",
            // Egypt
            "20"
          ],
          [
            "sv",
            // El Salvador
            "503"
          ],
          [
            "gq",
            // Equatorial Guinea
            "240"
          ],
          [
            "er",
            // Eritrea
            "291"
          ],
          [
            "ee",
            // Estonia
            "372"
          ],
          [
            "sz",
            // Eswatini
            "268"
          ],
          [
            "et",
            // Ethiopia
            "251"
          ],
          [
            "fk",
            // Falkland Islands (Malvinas)
            "500"
          ],
          [
            "fo",
            // Faroe Islands
            "298"
          ],
          [
            "fj",
            // Fiji
            "679"
          ],
          [
            "fi",
            // Finland
            "358",
            0
          ],
          [
            "fr",
            // France
            "33"
          ],
          [
            "gf",
            // French Guiana
            "594"
          ],
          [
            "pf",
            // French Polynesia
            "689"
          ],
          [
            "ga",
            // Gabon
            "241"
          ],
          [
            "gm",
            // Gambia
            "220"
          ],
          [
            "ge",
            // Georgia
            "995"
          ],
          [
            "de",
            // Germany
            "49"
          ],
          [
            "gh",
            // Ghana
            "233"
          ],
          [
            "gi",
            // Gibraltar
            "350"
          ],
          [
            "gr",
            // Greece
            "30"
          ],
          [
            "gl",
            // Greenland
            "299"
          ],
          [
            "gd",
            // Grenada
            "1",
            14,
            ["473"]
          ],
          [
            "gp",
            // Guadeloupe
            "590",
            0
          ],
          [
            "gu",
            // Guam
            "1",
            15,
            ["671"]
          ],
          [
            "gt",
            // Guatemala
            "502"
          ],
          [
            "gg",
            // Guernsey
            "44",
            1,
            ["1481", "7781", "7839", "7911"],
            "0"
          ],
          [
            "gn",
            // Guinea
            "224"
          ],
          [
            "gw",
            // Guinea-Bissau
            "245"
          ],
          [
            "gy",
            // Guyana
            "592"
          ],
          [
            "ht",
            // Haiti
            "509"
          ],
          [
            "hn",
            // Honduras
            "504"
          ],
          [
            "hk",
            // Hong Kong SAR China
            "852"
          ],
          [
            "hu",
            // Hungary
            "36"
          ],
          [
            "is",
            // Iceland
            "354"
          ],
          [
            "in",
            // India
            "91"
          ],
          [
            "id",
            // Indonesia
            "62"
          ],
          [
            "ir",
            // Iran
            "98"
          ],
          [
            "iq",
            // Iraq
            "964"
          ],
          [
            "ie",
            // Ireland
            "353"
          ],
          [
            "im",
            // Isle of Man
            "44",
            2,
            ["1624", "74576", "7524", "7924", "7624"],
            "0"
          ],
          [
            "il",
            // Israel
            "972"
          ],
          [
            "it",
            // Italy
            "39",
            0
          ],
          [
            "jm",
            // Jamaica
            "1",
            4,
            ["876", "658"]
          ],
          [
            "jp",
            // Japan
            "81"
          ],
          [
            "je",
            // Jersey
            "44",
            3,
            ["1534", "7509", "7700", "7797", "7829", "7937"],
            "0"
          ],
          [
            "jo",
            // Jordan
            "962"
          ],
          [
            "kz",
            // Kazakhstan
            "7",
            1,
            ["33", "7"],
            "8"
          ],
          [
            "ke",
            // Kenya
            "254"
          ],
          [
            "ki",
            // Kiribati
            "686"
          ],
          [
            "xk",
            // Kosovo
            "383"
          ],
          [
            "kw",
            // Kuwait
            "965"
          ],
          [
            "kg",
            // Kyrgyzstan
            "996"
          ],
          [
            "la",
            // Laos
            "856"
          ],
          [
            "lv",
            // Latvia
            "371"
          ],
          [
            "lb",
            // Lebanon
            "961"
          ],
          [
            "ls",
            // Lesotho
            "266"
          ],
          [
            "lr",
            // Liberia
            "231"
          ],
          [
            "ly",
            // Libya
            "218"
          ],
          [
            "li",
            // Liechtenstein
            "423"
          ],
          [
            "lt",
            // Lithuania
            "370"
          ],
          [
            "lu",
            // Luxembourg
            "352"
          ],
          [
            "mo",
            // Macao SAR China
            "853"
          ],
          [
            "mg",
            // Madagascar
            "261"
          ],
          [
            "mw",
            // Malawi
            "265"
          ],
          [
            "my",
            // Malaysia
            "60"
          ],
          [
            "mv",
            // Maldives
            "960"
          ],
          [
            "ml",
            // Mali
            "223"
          ],
          [
            "mt",
            // Malta
            "356"
          ],
          [
            "mh",
            // Marshall Islands
            "692"
          ],
          [
            "mq",
            // Martinique
            "596"
          ],
          [
            "mr",
            // Mauritania
            "222"
          ],
          [
            "mu",
            // Mauritius
            "230"
          ],
          [
            "yt",
            // Mayotte
            "262",
            1,
            ["269", "639"],
            "0"
          ],
          [
            "mx",
            // Mexico
            "52"
          ],
          [
            "fm",
            // Micronesia
            "691"
          ],
          [
            "md",
            // Moldova
            "373"
          ],
          [
            "mc",
            // Monaco
            "377"
          ],
          [
            "mn",
            // Mongolia
            "976"
          ],
          [
            "me",
            // Montenegro
            "382"
          ],
          [
            "ms",
            // Montserrat
            "1",
            16,
            ["664"]
          ],
          [
            "ma",
            // Morocco
            "212",
            0,
            null,
            "0"
          ],
          [
            "mz",
            // Mozambique
            "258"
          ],
          [
            "mm",
            // Myanmar (Burma)
            "95"
          ],
          [
            "na",
            // Namibia
            "264"
          ],
          [
            "nr",
            // Nauru
            "674"
          ],
          [
            "np",
            // Nepal
            "977"
          ],
          [
            "nl",
            // Netherlands
            "31"
          ],
          [
            "nc",
            // New Caledonia
            "687"
          ],
          [
            "nz",
            // New Zealand
            "64"
          ],
          [
            "ni",
            // Nicaragua
            "505"
          ],
          [
            "ne",
            // Niger
            "227"
          ],
          [
            "ng",
            // Nigeria
            "234"
          ],
          [
            "nu",
            // Niue
            "683"
          ],
          [
            "nf",
            // Norfolk Island
            "672"
          ],
          [
            "kp",
            // North Korea
            "850"
          ],
          [
            "mk",
            // North Macedonia
            "389"
          ],
          [
            "mp",
            // Northern Mariana Islands
            "1",
            17,
            ["670"]
          ],
          [
            "no",
            // Norway
            "47",
            0
          ],
          [
            "om",
            // Oman
            "968"
          ],
          [
            "pk",
            // Pakistan
            "92"
          ],
          [
            "pw",
            // Palau
            "680"
          ],
          [
            "ps",
            // Palestinian Territories
            "970"
          ],
          [
            "pa",
            // Panama
            "507"
          ],
          [
            "pg",
            // Papua New Guinea
            "675"
          ],
          [
            "py",
            // Paraguay
            "595"
          ],
          [
            "pe",
            // Peru
            "51"
          ],
          [
            "ph",
            // Philippines
            "63"
          ],
          [
            "pl",
            // Poland
            "48"
          ],
          [
            "pt",
            // Portugal
            "351"
          ],
          [
            "pr",
            // Puerto Rico
            "1",
            3,
            ["787", "939"]
          ],
          [
            "qa",
            // Qatar
            "974"
          ],
          [
            "re",
            // Réunion
            "262",
            0,
            null,
            "0"
          ],
          [
            "ro",
            // Romania
            "40"
          ],
          [
            "ru",
            // Russia
            "7",
            0,
            null,
            "8"
          ],
          [
            "rw",
            // Rwanda
            "250"
          ],
          [
            "ws",
            // Samoa
            "685"
          ],
          [
            "sm",
            // San Marino
            "378"
          ],
          [
            "st",
            // São Tomé & Príncipe
            "239"
          ],
          [
            "sa",
            // Saudi Arabia
            "966"
          ],
          [
            "sn",
            // Senegal
            "221"
          ],
          [
            "rs",
            // Serbia
            "381"
          ],
          [
            "sc",
            // Seychelles
            "248"
          ],
          [
            "sl",
            // Sierra Leone
            "232"
          ],
          [
            "sg",
            // Singapore
            "65"
          ],
          [
            "sx",
            // Sint Maarten
            "1",
            21,
            ["721"]
          ],
          [
            "sk",
            // Slovakia
            "421"
          ],
          [
            "si",
            // Slovenia
            "386"
          ],
          [
            "sb",
            // Solomon Islands
            "677"
          ],
          [
            "so",
            // Somalia
            "252"
          ],
          [
            "za",
            // South Africa
            "27"
          ],
          [
            "kr",
            // South Korea
            "82"
          ],
          [
            "ss",
            // South Sudan
            "211"
          ],
          [
            "es",
            // Spain
            "34"
          ],
          [
            "lk",
            // Sri Lanka
            "94"
          ],
          [
            "bl",
            // St. Barthélemy
            "590",
            1
          ],
          [
            "sh",
            // St. Helena
            "290"
          ],
          [
            "kn",
            // St. Kitts & Nevis
            "1",
            18,
            ["869"]
          ],
          [
            "lc",
            // St. Lucia
            "1",
            19,
            ["758"]
          ],
          [
            "mf",
            // St. Martin
            "590",
            2
          ],
          [
            "pm",
            // St. Pierre & Miquelon
            "508"
          ],
          [
            "vc",
            // St. Vincent & Grenadines
            "1",
            20,
            ["784"]
          ],
          [
            "sd",
            // Sudan
            "249"
          ],
          [
            "sr",
            // Suriname
            "597"
          ],
          [
            "sj",
            // Svalbard & Jan Mayen
            "47",
            1,
            ["79"]
          ],
          [
            "se",
            // Sweden
            "46"
          ],
          [
            "ch",
            // Switzerland
            "41"
          ],
          [
            "sy",
            // Syria
            "963"
          ],
          [
            "tw",
            // Taiwan
            "886"
          ],
          [
            "tj",
            // Tajikistan
            "992"
          ],
          [
            "tz",
            // Tanzania
            "255"
          ],
          [
            "th",
            // Thailand
            "66"
          ],
          [
            "tl",
            // Timor-Leste
            "670"
          ],
          [
            "tg",
            // Togo
            "228"
          ],
          [
            "tk",
            // Tokelau
            "690"
          ],
          [
            "to",
            // Tonga
            "676"
          ],
          [
            "tt",
            // Trinidad & Tobago
            "1",
            22,
            ["868"]
          ],
          [
            "tn",
            // Tunisia
            "216"
          ],
          [
            "tr",
            // Turkey
            "90"
          ],
          [
            "tm",
            // Turkmenistan
            "993"
          ],
          [
            "tc",
            // Turks & Caicos Islands
            "1",
            23,
            ["649"]
          ],
          [
            "tv",
            // Tuvalu
            "688"
          ],
          [
            "ug",
            // Uganda
            "256"
          ],
          [
            "ua",
            // Ukraine
            "380"
          ],
          [
            "ae",
            // United Arab Emirates
            "971"
          ],
          [
            "gb",
            // United Kingdom
            "44",
            0,
            null,
            "0"
          ],
          [
            "us",
            // United States
            "1",
            0
          ],
          [
            "uy",
            // Uruguay
            "598"
          ],
          [
            "vi",
            // U.S. Virgin Islands
            "1",
            24,
            ["340"]
          ],
          [
            "uz",
            // Uzbekistan
            "998"
          ],
          [
            "vu",
            // Vanuatu
            "678"
          ],
          [
            "va",
            // Vatican City
            "39",
            1,
            ["06698"]
          ],
          [
            "ve",
            // Venezuela
            "58"
          ],
          [
            "vn",
            // Vietnam
            "84"
          ],
          [
            "wf",
            // Wallis & Futuna
            "681"
          ],
          [
            "eh",
            // Western Sahara
            "212",
            1,
            ["5288", "5289"],
            "0"
          ],
          [
            "ye",
            // Yemen
            "967"
          ],
          [
            "zm",
            // Zambia
            "260"
          ],
          [
            "zw",
            // Zimbabwe
            "263"
          ]
        ];
        var allCountries = [];
        for (let i = 0; i < rawCountryData.length; i++) {
          const c = rawCountryData[i];
          allCountries[i] = {
            name: "",
            // this is now populated in the plugin
            iso2: c[0],
            dialCode: c[1],
            priority: c[2] || 0,
            areaCodes: c[3] || null,
            nodeById: {},
            nationalPrefix: c[4] || null
          };
        }
        var data_default = allCountries;
        var countryTranslations = {
          ad: "Andorra",
          ae: "United Arab Emirates",
          af: "Afghanistan",
          ag: "Antigua & Barbuda",
          ai: "Anguilla",
          al: "Albania",
          am: "Armenia",
          ao: "Angola",
          ar: "Argentina",
          as: "American Samoa",
          at: "Austria",
          au: "Australia",
          aw: "Aruba",
          ax: "Åland Islands",
          az: "Azerbaijan",
          ba: "Bosnia & Herzegovina",
          bb: "Barbados",
          bd: "Bangladesh",
          be: "Belgium",
          bf: "Burkina Faso",
          bg: "Bulgaria",
          bh: "Bahrain",
          bi: "Burundi",
          bj: "Benin",
          bl: "St. Barthélemy",
          bm: "Bermuda",
          bn: "Brunei",
          bo: "Bolivia",
          bq: "Caribbean Netherlands",
          br: "Brazil",
          bs: "Bahamas",
          bt: "Bhutan",
          bw: "Botswana",
          by: "Belarus",
          bz: "Belize",
          ca: "Canada",
          cc: "Cocos (Keeling) Islands",
          cd: "Congo - Kinshasa",
          cf: "Central African Republic",
          cg: "Congo - Brazzaville",
          ch: "Switzerland",
          ci: "Côte d’Ivoire",
          ck: "Cook Islands",
          cl: "Chile",
          cm: "Cameroon",
          cn: "China",
          co: "Colombia",
          cr: "Costa Rica",
          cu: "Cuba",
          cv: "Cape Verde",
          cw: "Curaçao",
          cx: "Christmas Island",
          cy: "Cyprus",
          cz: "Czechia",
          de: "Germany",
          dj: "Djibouti",
          dk: "Denmark",
          dm: "Dominica",
          do: "Dominican Republic",
          dz: "Algeria",
          ec: "Ecuador",
          ee: "Estonia",
          eg: "Egypt",
          eh: "Western Sahara",
          er: "Eritrea",
          es: "Spain",
          et: "Ethiopia",
          fi: "Finland",
          fj: "Fiji",
          fk: "Falkland Islands",
          fm: "Micronesia",
          fo: "Faroe Islands",
          fr: "France",
          ga: "Gabon",
          gb: "United Kingdom",
          gd: "Grenada",
          ge: "Georgia",
          gf: "French Guiana",
          gg: "Guernsey",
          gh: "Ghana",
          gi: "Gibraltar",
          gl: "Greenland",
          gm: "Gambia",
          gn: "Guinea",
          gp: "Guadeloupe",
          gq: "Equatorial Guinea",
          gr: "Greece",
          gt: "Guatemala",
          gu: "Guam",
          gw: "Guinea-Bissau",
          gy: "Guyana",
          hk: "Hong Kong SAR China",
          hn: "Honduras",
          hr: "Croatia",
          ht: "Haiti",
          hu: "Hungary",
          id: "Indonesia",
          ie: "Ireland",
          il: "Israel",
          im: "Isle of Man",
          in: "India",
          io: "British Indian Ocean Territory",
          iq: "Iraq",
          ir: "Iran",
          is: "Iceland",
          it: "Italy",
          je: "Jersey",
          jm: "Jamaica",
          jo: "Jordan",
          jp: "Japan",
          ke: "Kenya",
          kg: "Kyrgyzstan",
          kh: "Cambodia",
          ki: "Kiribati",
          km: "Comoros",
          kn: "St. Kitts & Nevis",
          kp: "North Korea",
          kr: "South Korea",
          kw: "Kuwait",
          ky: "Cayman Islands",
          kz: "Kazakhstan",
          la: "Laos",
          lb: "Lebanon",
          lc: "St. Lucia",
          li: "Liechtenstein",
          lk: "Sri Lanka",
          lr: "Liberia",
          ls: "Lesotho",
          lt: "Lithuania",
          lu: "Luxembourg",
          lv: "Latvia",
          ly: "Libya",
          ma: "Morocco",
          mc: "Monaco",
          md: "Moldova",
          me: "Montenegro",
          mf: "St. Martin",
          mg: "Madagascar",
          mh: "Marshall Islands",
          mk: "North Macedonia",
          ml: "Mali",
          mm: "Myanmar (Burma)",
          mn: "Mongolia",
          mo: "Macao SAR China",
          mp: "Northern Mariana Islands",
          mq: "Martinique",
          mr: "Mauritania",
          ms: "Montserrat",
          mt: "Malta",
          mu: "Mauritius",
          mv: "Maldives",
          mw: "Malawi",
          mx: "Mexico",
          my: "Malaysia",
          mz: "Mozambique",
          na: "Namibia",
          nc: "New Caledonia",
          ne: "Niger",
          nf: "Norfolk Island",
          ng: "Nigeria",
          ni: "Nicaragua",
          nl: "Netherlands",
          no: "Norway",
          np: "Nepal",
          nr: "Nauru",
          nu: "Niue",
          nz: "New Zealand",
          om: "Oman",
          pa: "Panama",
          pe: "Peru",
          pf: "French Polynesia",
          pg: "Papua New Guinea",
          ph: "Philippines",
          pk: "Pakistan",
          pl: "Poland",
          pm: "St. Pierre & Miquelon",
          pr: "Puerto Rico",
          ps: "Palestinian Territories",
          pt: "Portugal",
          pw: "Palau",
          py: "Paraguay",
          qa: "Qatar",
          re: "Réunion",
          ro: "Romania",
          rs: "Serbia",
          ru: "Russia",
          rw: "Rwanda",
          sa: "Saudi Arabia",
          sb: "Solomon Islands",
          sc: "Seychelles",
          sd: "Sudan",
          se: "Sweden",
          sg: "Singapore",
          sh: "St. Helena",
          si: "Slovenia",
          sj: "Svalbard & Jan Mayen",
          sk: "Slovakia",
          sl: "Sierra Leone",
          sm: "San Marino",
          sn: "Senegal",
          so: "Somalia",
          sr: "Suriname",
          ss: "South Sudan",
          st: "São Tomé & Príncipe",
          sv: "El Salvador",
          sx: "Sint Maarten",
          sy: "Syria",
          sz: "Eswatini",
          tc: "Turks & Caicos Islands",
          td: "Chad",
          tg: "Togo",
          th: "Thailand",
          tj: "Tajikistan",
          tk: "Tokelau",
          tl: "Timor-Leste",
          tm: "Turkmenistan",
          tn: "Tunisia",
          to: "Tonga",
          tr: "Turkey",
          tt: "Trinidad & Tobago",
          tv: "Tuvalu",
          tw: "Taiwan",
          tz: "Tanzania",
          ua: "Ukraine",
          ug: "Uganda",
          us: "United States",
          uy: "Uruguay",
          uz: "Uzbekistan",
          va: "Vatican City",
          vc: "St. Vincent & Grenadines",
          ve: "Venezuela",
          vg: "British Virgin Islands",
          vi: "U.S. Virgin Islands",
          vn: "Vietnam",
          vu: "Vanuatu",
          wf: "Wallis & Futuna",
          ws: "Samoa",
          ye: "Yemen",
          yt: "Mayotte",
          za: "South Africa",
          zm: "Zambia",
          zw: "Zimbabwe"
        };
        var countries_default = countryTranslations;
        var interfaceTranslations = {
          selectedCountryAriaLabel: "Selected country",
          noCountrySelected: "No country selected",
          countryListAriaLabel: "List of countries",
          searchPlaceholder: "Search",
          zeroSearchResults: "No results found",
          oneSearchResult: "1 result found",
          multipleSearchResults: "${count} results found",
          // additional countries (not supported by country-list library)
          ac: "Ascension Island",
          xk: "Kosovo"
        };
        var interface_default = interfaceTranslations;
        var allTranslations = { ...countries_default, ...interface_default };
        var en_default = allTranslations;
        for (let i = 0; i < data_default.length; i++) {
          data_default[i].name = en_default[data_default[i].iso2];
        }
        var id = 0;
        var defaults2 = {
          //* Whether or not to allow the dropdown.
          allowDropdown: true,
          //* Add a placeholder in the input with an example number for the selected country.
          autoPlaceholder: "polite",
          //* Modify the parentClass.
          containerClass: "",
          //* The order of the countries in the dropdown. Defaults to alphabetical.
          countryOrder: null,
          //* Add a country search input at the top of the dropdown.
          countrySearch: true,
          //* Modify the auto placeholder.
          customPlaceholder: null,
          //* Append menu to specified element.
          dropdownContainer: null,
          //* Don't display these countries.
          excludeCountries: [],
          //* Fix the dropdown width to the input width (rather than being as wide as the longest country name).
          fixDropdownWidth: true,
          //* Format the number as the user types
          formatAsYouType: true,
          //* Format the input value during initialisation and on setNumber.
          formatOnDisplay: true,
          //* geoIp lookup function.
          geoIpLookup: null,
          //* Inject a hidden input with the name returned from this function, and on submit, populate it with the result of getNumber.
          hiddenInput: null,
          //* Internationalise the plugin text e.g. search input placeholder, country names.
          i18n: {},
          //* Initial country.
          initialCountry: "",
          //* A function to load the utils script.
          loadUtils: null,
          //* National vs international formatting for numbers e.g. placeholders and displaying existing numbers.
          nationalMode: true,
          //* Display only these countries.
          onlyCountries: [],
          //* Number type to use for placeholders.
          placeholderNumberType: "MOBILE",
          //* Show flags - for both the selected country, and in the country dropdown
          showFlags: true,
          //* Display the international dial code next to the selected flag.
          separateDialCode: false,
          //* Only allow certain chars e.g. a plus followed by numeric digits, and cap at max valid length.
          strictMode: false,
          //* Use full screen popup instead of dropdown for country list.
          useFullscreenPopup: typeof navigator !== "undefined" && typeof window !== "undefined" ? (
            //* We cannot just test screen size as some smartphones/website meta tags will report desktop resolutions.
            //* Note: to target Android Mobiles (and not Tablets), we must find 'Android' and 'Mobile'
            /Android.+Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            ) || window.innerWidth <= 500
          ) : false,
          //* The number type to enforce during validation.
          validationNumberTypes: ["MOBILE"]
        };
        var regionlessNanpNumbers = [
          "800",
          "822",
          "833",
          "844",
          "855",
          "866",
          "877",
          "880",
          "881",
          "882",
          "883",
          "884",
          "885",
          "886",
          "887",
          "888",
          "889"
        ];
        var getNumeric = (s) => s.replace(/\D/g, "");
        var normaliseString = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        var isRegionlessNanp = (number) => {
          const numeric = getNumeric(number);
          if (numeric.charAt(0) === "1") {
            const areaCode = numeric.substr(1, 3);
            return regionlessNanpNumbers.includes(areaCode);
          }
          return false;
        };
        var translateCursorPosition = (relevantChars, formattedValue, prevCaretPos, isDeleteForwards) => {
          if (prevCaretPos === 0 && !isDeleteForwards) {
            return 0;
          }
          let count = 0;
          for (let i = 0; i < formattedValue.length; i++) {
            if (/[+0-9]/.test(formattedValue[i])) {
              count++;
            }
            if (count === relevantChars && !isDeleteForwards) {
              return i + 1;
            }
            if (isDeleteForwards && count === relevantChars + 1) {
              return i;
            }
          }
          return formattedValue.length;
        };
        var createEl = (name, attrs, container) => {
          const el = document.createElement(name);
          if (attrs) {
            Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
          }
          if (container) {
            container.appendChild(el);
          }
          return el;
        };
        var forEachInstance = (method, ...args) => {
          const { instances } = intlTelInput2;
          Object.values(instances).forEach((instance) => instance[method](...args));
        };
        var Iti = class {
          constructor(input, customOptions = {}) {
            this.id = id++;
            this.telInput = input;
            this.highlightedItem = null;
            this.options = Object.assign({}, defaults2, customOptions);
            this.hadInitialPlaceholder = Boolean(input.getAttribute("placeholder"));
          }
          //* Can't be private as it's called from intlTelInput convenience wrapper.
          _init() {
            if (this.options.useFullscreenPopup) {
              this.options.fixDropdownWidth = false;
            }
            if (this.options.onlyCountries.length === 1) {
              this.options.initialCountry = this.options.onlyCountries[0];
            }
            if (this.options.separateDialCode) {
              this.options.nationalMode = false;
            }
            if (this.options.allowDropdown && !this.options.showFlags && !this.options.separateDialCode) {
              this.options.nationalMode = false;
            }
            if (this.options.useFullscreenPopup && !this.options.dropdownContainer) {
              this.options.dropdownContainer = document.body;
            }
            this.isAndroid = typeof navigator !== "undefined" ? /Android/i.test(navigator.userAgent) : false;
            this.isRTL = !!this.telInput.closest("[dir=rtl]");
            const showOnDefaultSide = this.options.allowDropdown || this.options.separateDialCode;
            this.showSelectedCountryOnLeft = this.isRTL ? !showOnDefaultSide : showOnDefaultSide;
            if (this.options.separateDialCode) {
              if (this.isRTL) {
                this.originalPaddingRight = this.telInput.style.paddingRight;
              } else {
                this.originalPaddingLeft = this.telInput.style.paddingLeft;
              }
            }
            this.options.i18n = { ...en_default, ...this.options.i18n };
            const autoCountryPromise = new Promise((resolve, reject) => {
              this.resolveAutoCountryPromise = resolve;
              this.rejectAutoCountryPromise = reject;
            });
            const utilsScriptPromise = new Promise((resolve, reject) => {
              this.resolveUtilsScriptPromise = resolve;
              this.rejectUtilsScriptPromise = reject;
            });
            this.promise = Promise.all([autoCountryPromise, utilsScriptPromise]);
            this.selectedCountryData = {};
            this._processCountryData();
            this._generateMarkup();
            this._setInitialState();
            this._initListeners();
            this._initRequests();
          }
          //********************
          //*  PRIVATE METHODS
          //********************
          //* Prepare all of the country data, including onlyCountries, excludeCountries, countryOrder options.
          _processCountryData() {
            this._processAllCountries();
            this._processDialCodes();
            this._translateCountryNames();
            this._sortCountries();
          }
          //* Sort countries by countryOrder option (if present), then name.
          _sortCountries() {
            if (this.options.countryOrder) {
              this.options.countryOrder = this.options.countryOrder.map((country) => country.toLowerCase());
            }
            this.countries.sort((a, b) => {
              const { countryOrder } = this.options;
              if (countryOrder) {
                const aIndex = countryOrder.indexOf(a.iso2);
                const bIndex = countryOrder.indexOf(b.iso2);
                const aIndexExists = aIndex > -1;
                const bIndexExists = bIndex > -1;
                if (aIndexExists || bIndexExists) {
                  if (aIndexExists && bIndexExists) {
                    return aIndex - bIndex;
                  }
                  return aIndexExists ? -1 : 1;
                }
              }
              return a.name.localeCompare(b.name);
            });
          }
          //* Add a dial code to this.dialCodeToIso2Map.
          _addToDialCodeMap(iso2, dialCode, priority) {
            if (dialCode.length > this.dialCodeMaxLen) {
              this.dialCodeMaxLen = dialCode.length;
            }
            if (!this.dialCodeToIso2Map.hasOwnProperty(dialCode)) {
              this.dialCodeToIso2Map[dialCode] = [];
            }
            for (let i = 0; i < this.dialCodeToIso2Map[dialCode].length; i++) {
              if (this.dialCodeToIso2Map[dialCode][i] === iso2) {
                return;
              }
            }
            const index = priority !== void 0 ? priority : this.dialCodeToIso2Map[dialCode].length;
            this.dialCodeToIso2Map[dialCode][index] = iso2;
          }
          //* Process onlyCountries or excludeCountries array if present.
          _processAllCountries() {
            const { onlyCountries, excludeCountries } = this.options;
            if (onlyCountries.length) {
              const lowerCaseOnlyCountries = onlyCountries.map(
                (country) => country.toLowerCase()
              );
              this.countries = data_default.filter(
                (country) => lowerCaseOnlyCountries.includes(country.iso2)
              );
            } else if (excludeCountries.length) {
              const lowerCaseExcludeCountries = excludeCountries.map(
                (country) => country.toLowerCase()
              );
              this.countries = data_default.filter(
                (country) => !lowerCaseExcludeCountries.includes(country.iso2)
              );
            } else {
              this.countries = data_default;
            }
          }
          //* Translate Countries by object literal provided on config.
          _translateCountryNames() {
            for (let i = 0; i < this.countries.length; i++) {
              const iso2 = this.countries[i].iso2.toLowerCase();
              if (this.options.i18n.hasOwnProperty(iso2)) {
                this.countries[i].name = this.options.i18n[iso2];
              }
            }
          }
          //* Generate this.dialCodes and this.dialCodeToIso2Map.
          _processDialCodes() {
            this.dialCodes = {};
            this.dialCodeMaxLen = 0;
            this.dialCodeToIso2Map = {};
            for (let i = 0; i < this.countries.length; i++) {
              const c = this.countries[i];
              if (!this.dialCodes[c.dialCode]) {
                this.dialCodes[c.dialCode] = true;
              }
              this._addToDialCodeMap(c.iso2, c.dialCode, c.priority);
            }
            for (let i = 0; i < this.countries.length; i++) {
              const c = this.countries[i];
              if (c.areaCodes) {
                const rootIso2Code = this.dialCodeToIso2Map[c.dialCode][0];
                for (let j = 0; j < c.areaCodes.length; j++) {
                  const areaCode = c.areaCodes[j];
                  for (let k = 1; k < areaCode.length; k++) {
                    const partialAreaCode = areaCode.substr(0, k);
                    const partialDialCode = c.dialCode + partialAreaCode;
                    this._addToDialCodeMap(rootIso2Code, partialDialCode);
                    this._addToDialCodeMap(c.iso2, partialDialCode);
                  }
                  this._addToDialCodeMap(c.iso2, c.dialCode + areaCode);
                }
              }
            }
          }
          //* Generate all of the markup for the plugin: the selected country overlay, and the dropdown.
          _generateMarkup() {
            var _a, _b, _c;
            this.telInput.classList.add("iti__tel-input");
            if (!this.telInput.hasAttribute("autocomplete") && !(this.telInput.form && this.telInput.form.hasAttribute("autocomplete"))) {
              this.telInput.setAttribute("autocomplete", "off");
            }
            const {
              allowDropdown,
              separateDialCode,
              showFlags,
              containerClass,
              hiddenInput,
              dropdownContainer,
              fixDropdownWidth,
              useFullscreenPopup,
              countrySearch,
              i18n
            } = this.options;
            let parentClass = "iti";
            if (allowDropdown) {
              parentClass += " iti--allow-dropdown";
            }
            if (showFlags) {
              parentClass += " iti--show-flags";
            }
            if (containerClass) {
              parentClass += ` ${containerClass}`;
            }
            if (!useFullscreenPopup) {
              parentClass += " iti--inline-dropdown";
            }
            const wrapper = createEl("div", { class: parentClass });
            (_a = this.telInput.parentNode) == null ? void 0 : _a.insertBefore(wrapper, this.telInput);
            if (allowDropdown || showFlags || separateDialCode) {
              this.countryContainer = createEl(
                "div",
                { class: "iti__country-container" },
                wrapper
              );
              if (this.showSelectedCountryOnLeft) {
                this.countryContainer.style.left = "0px";
              } else {
                this.countryContainer.style.right = "0px";
              }
              if (allowDropdown) {
                this.selectedCountry = createEl(
                  "button",
                  {
                    type: "button",
                    class: "iti__selected-country",
                    "aria-expanded": "false",
                    "aria-label": this.options.i18n.selectedCountryAriaLabel,
                    "aria-haspopup": "true",
                    "aria-controls": `iti-${this.id}__dropdown-content`,
                    "role": "combobox"
                  },
                  this.countryContainer
                );
                if (this.telInput.disabled) {
                  this.selectedCountry.setAttribute("disabled", "true");
                }
              } else {
                this.selectedCountry = createEl(
                  "div",
                  { class: "iti__selected-country" },
                  this.countryContainer
                );
              }
              const selectedCountryPrimary = createEl("div", { class: "iti__selected-country-primary" }, this.selectedCountry);
              this.selectedCountryInner = createEl("div", { class: "iti__flag" }, selectedCountryPrimary);
              this.selectedCountryA11yText = createEl(
                "span",
                { class: "iti__a11y-text" },
                this.selectedCountryInner
              );
              if (allowDropdown) {
                this.dropdownArrow = createEl(
                  "div",
                  { class: "iti__arrow", "aria-hidden": "true" },
                  selectedCountryPrimary
                );
              }
              if (separateDialCode) {
                this.selectedDialCode = createEl(
                  "div",
                  { class: "iti__selected-dial-code" },
                  this.selectedCountry
                );
              }
              if (allowDropdown) {
                const extraClasses = fixDropdownWidth ? "" : "iti--flexible-dropdown-width";
                this.dropdownContent = createEl("div", {
                  id: `iti-${this.id}__dropdown-content`,
                  class: `iti__dropdown-content iti__hide ${extraClasses}`
                });
                if (countrySearch) {
                  this.searchInput = createEl(
                    "input",
                    {
                      type: "text",
                      class: "iti__search-input",
                      placeholder: i18n.searchPlaceholder,
                      role: "combobox",
                      "aria-expanded": "true",
                      "aria-label": i18n.searchPlaceholder,
                      "aria-controls": `iti-${this.id}__country-listbox`,
                      "aria-autocomplete": "list",
                      "autocomplete": "off"
                    },
                    this.dropdownContent
                  );
                  this.searchResultsA11yText = createEl(
                    "span",
                    { class: "iti__a11y-text" },
                    this.dropdownContent
                  );
                }
                this.countryList = createEl(
                  "ul",
                  {
                    class: "iti__country-list",
                    id: `iti-${this.id}__country-listbox`,
                    role: "listbox",
                    "aria-label": i18n.countryListAriaLabel
                  },
                  this.dropdownContent
                );
                this._appendListItems();
                if (countrySearch) {
                  this._updateSearchResultsText();
                }
                if (dropdownContainer) {
                  let dropdownClasses = "iti iti--container";
                  if (useFullscreenPopup) {
                    dropdownClasses += " iti--fullscreen-popup";
                  } else {
                    dropdownClasses += " iti--inline-dropdown";
                  }
                  this.dropdown = createEl("div", { class: dropdownClasses });
                  this.dropdown.appendChild(this.dropdownContent);
                } else {
                  this.countryContainer.appendChild(this.dropdownContent);
                }
              }
            }
            wrapper.appendChild(this.telInput);
            this._updateInputPadding();
            if (hiddenInput) {
              const telInputName = this.telInput.getAttribute("name") || "";
              const names = hiddenInput(telInputName);
              if (names.phone) {
                const existingInput = (_b = this.telInput.form) == null ? void 0 : _b.querySelector(`input[name="${names.phone}"]`);
                if (existingInput) {
                  this.hiddenInput = existingInput;
                } else {
                  this.hiddenInput = createEl("input", {
                    type: "hidden",
                    name: names.phone
                  });
                  wrapper.appendChild(this.hiddenInput);
                }
              }
              if (names.country) {
                const existingInput = (_c = this.telInput.form) == null ? void 0 : _c.querySelector(`input[name="${names.country}"]`);
                if (existingInput) {
                  this.hiddenInputCountry = existingInput;
                } else {
                  this.hiddenInputCountry = createEl("input", {
                    type: "hidden",
                    name: names.country
                  });
                  wrapper.appendChild(this.hiddenInputCountry);
                }
              }
            }
          }
          //* For each country: add a country list item <li> to the countryList <ul> container.
          _appendListItems() {
            for (let i = 0; i < this.countries.length; i++) {
              const c = this.countries[i];
              const extraClass = i === 0 ? "iti__highlight" : "";
              const listItem = createEl(
                "li",
                {
                  id: `iti-${this.id}__item-${c.iso2}`,
                  class: `iti__country ${extraClass}`,
                  tabindex: "-1",
                  role: "option",
                  "data-dial-code": c.dialCode,
                  "data-country-code": c.iso2,
                  "aria-selected": "false"
                },
                this.countryList
              );
              c.nodeById[this.id] = listItem;
              let content = "";
              if (this.options.showFlags) {
                content += `<div class='iti__flag iti__${c.iso2}'></div>`;
              }
              content += `<span class='iti__country-name'>${c.name}</span>`;
              content += `<span class='iti__dial-code'>+${c.dialCode}</span>`;
              listItem.insertAdjacentHTML("beforeend", content);
            }
          }
          //* Set the initial state of the input value and the selected country by:
          //* 1. Extracting a dial code from the given number
          //* 2. Using explicit initialCountry
          _setInitialState(overrideAutoCountry = false) {
            const attributeValue = this.telInput.getAttribute("value");
            const inputValue = this.telInput.value;
            const useAttribute = attributeValue && attributeValue.charAt(0) === "+" && (!inputValue || inputValue.charAt(0) !== "+");
            const val = useAttribute ? attributeValue : inputValue;
            const dialCode = this._getDialCode(val);
            const isRegionlessNanpNumber = isRegionlessNanp(val);
            const { initialCountry, geoIpLookup } = this.options;
            const isAutoCountry = initialCountry === "auto" && geoIpLookup;
            if (dialCode && !isRegionlessNanpNumber) {
              this._updateCountryFromNumber(val);
            } else if (!isAutoCountry || overrideAutoCountry) {
              const lowerInitialCountry = initialCountry ? initialCountry.toLowerCase() : "";
              const isValidInitialCountry = lowerInitialCountry && this._getCountryData(lowerInitialCountry, true);
              if (isValidInitialCountry) {
                this._setCountry(lowerInitialCountry);
              } else {
                if (dialCode && isRegionlessNanpNumber) {
                  this._setCountry("us");
                } else {
                  this._setCountry();
                }
              }
            }
            if (val) {
              this._updateValFromNumber(val);
            }
          }
          //* Initialise the main event listeners: input keyup, and click selected country.
          _initListeners() {
            this._initTelInputListeners();
            if (this.options.allowDropdown) {
              this._initDropdownListeners();
            }
            if ((this.hiddenInput || this.hiddenInputCountry) && this.telInput.form) {
              this._initHiddenInputListener();
            }
          }
          //* Update hidden input on form submit.
          _initHiddenInputListener() {
            var _a;
            this._handleHiddenInputSubmit = () => {
              if (this.hiddenInput) {
                this.hiddenInput.value = this.getNumber();
              }
              if (this.hiddenInputCountry) {
                this.hiddenInputCountry.value = this.getSelectedCountryData().iso2 || "";
              }
            };
            (_a = this.telInput.form) == null ? void 0 : _a.addEventListener(
              "submit",
              this._handleHiddenInputSubmit
            );
          }
          //* initialise the dropdown listeners.
          _initDropdownListeners() {
            this._handleLabelClick = (e) => {
              if (this.dropdownContent.classList.contains("iti__hide")) {
                this.telInput.focus();
              } else {
                e.preventDefault();
              }
            };
            const label = this.telInput.closest("label");
            if (label) {
              label.addEventListener("click", this._handleLabelClick);
            }
            this._handleClickSelectedCountry = () => {
              if (this.dropdownContent.classList.contains("iti__hide") && !this.telInput.disabled && !this.telInput.readOnly) {
                this._openDropdown();
              }
            };
            this.selectedCountry.addEventListener("click", this._handleClickSelectedCountry);
            this._handleCountryContainerKeydown = (e) => {
              const isDropdownHidden = this.dropdownContent.classList.contains("iti__hide");
              if (isDropdownHidden && ["ArrowUp", "ArrowDown", " ", "Enter"].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                this._openDropdown();
              }
              if (e.key === "Tab") {
                this._closeDropdown();
              }
            };
            this.countryContainer.addEventListener(
              "keydown",
              this._handleCountryContainerKeydown
            );
          }
          //* Init many requests: utils script / geo ip lookup.
          _initRequests() {
            let { loadUtils, initialCountry, geoIpLookup } = this.options;
            if (loadUtils && !intlTelInput2.utils) {
              this._handlePageLoad = () => {
                var _a;
                window.removeEventListener("load", this._handlePageLoad);
                (_a = intlTelInput2.attachUtils(loadUtils)) == null ? void 0 : _a.catch(() => {
                });
              };
              if (intlTelInput2.documentReady()) {
                this._handlePageLoad();
              } else {
                window.addEventListener("load", this._handlePageLoad);
              }
            } else {
              this.resolveUtilsScriptPromise();
            }
            const isAutoCountry = initialCountry === "auto" && geoIpLookup;
            if (isAutoCountry && !this.selectedCountryData.iso2) {
              this._loadAutoCountry();
            } else {
              this.resolveAutoCountryPromise();
            }
          }
          //* Perform the geo ip lookup.
          _loadAutoCountry() {
            if (intlTelInput2.autoCountry) {
              this.handleAutoCountry();
            } else if (!intlTelInput2.startedLoadingAutoCountry) {
              intlTelInput2.startedLoadingAutoCountry = true;
              if (typeof this.options.geoIpLookup === "function") {
                this.options.geoIpLookup(
                  (iso2 = "") => {
                    const iso2Lower = iso2.toLowerCase();
                    const isValidIso2 = iso2Lower && this._getCountryData(iso2Lower, true);
                    if (isValidIso2) {
                      intlTelInput2.autoCountry = iso2Lower;
                      setTimeout(() => forEachInstance("handleAutoCountry"));
                    } else {
                      this._setInitialState(true);
                      forEachInstance("rejectAutoCountryPromise");
                    }
                  },
                  () => {
                    this._setInitialState(true);
                    forEachInstance("rejectAutoCountryPromise");
                  }
                );
              }
            }
          }
          _openDropdownWithPlus() {
            this._openDropdown();
            this.searchInput.value = "+";
            this._filterCountries("", true);
          }
          //* Initialize the tel input listeners.
          _initTelInputListeners() {
            const { strictMode, formatAsYouType, separateDialCode, formatOnDisplay, allowDropdown, countrySearch } = this.options;
            let userOverrideFormatting = false;
            if (new RegExp("\\p{L}", "u").test(this.telInput.value)) {
              userOverrideFormatting = true;
            }
            this._handleInputEvent = (e) => {
              if (this.isAndroid && (e == null ? void 0 : e.data) === "+" && separateDialCode && allowDropdown && countrySearch) {
                const currentCaretPos = this.telInput.selectionStart || 0;
                const valueBeforeCaret = this.telInput.value.substring(0, currentCaretPos - 1);
                const valueAfterCaret = this.telInput.value.substring(currentCaretPos);
                this.telInput.value = valueBeforeCaret + valueAfterCaret;
                this._openDropdownWithPlus();
                return;
              }
              if (this._updateCountryFromNumber(this.telInput.value)) {
                this._triggerCountryChange();
              }
              const isFormattingChar = (e == null ? void 0 : e.data) && /[^+0-9]/.test(e.data);
              const isPaste = (e == null ? void 0 : e.inputType) === "insertFromPaste" && this.telInput.value;
              if (isFormattingChar || isPaste && !strictMode) {
                userOverrideFormatting = true;
              } else if (!/[^+0-9]/.test(this.telInput.value)) {
                userOverrideFormatting = false;
              }
              const disableFormatOnSetNumber = (e == null ? void 0 : e.detail) && e.detail["isSetNumber"] && !formatOnDisplay;
              if (formatAsYouType && !userOverrideFormatting && !disableFormatOnSetNumber) {
                const currentCaretPos = this.telInput.selectionStart || 0;
                const valueBeforeCaret = this.telInput.value.substring(0, currentCaretPos);
                const relevantCharsBeforeCaret = valueBeforeCaret.replace(/[^+0-9]/g, "").length;
                const isDeleteForwards = (e == null ? void 0 : e.inputType) === "deleteContentForward";
                const formattedValue = this._formatNumberAsYouType();
                const newCaretPos = translateCursorPosition(relevantCharsBeforeCaret, formattedValue, currentCaretPos, isDeleteForwards);
                this.telInput.value = formattedValue;
                this.telInput.setSelectionRange(newCaretPos, newCaretPos);
              }
            };
            this.telInput.addEventListener("input", this._handleInputEvent);
            if (strictMode || separateDialCode) {
              this._handleKeydownEvent = (e) => {
                if (e.key && e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
                  if (separateDialCode && allowDropdown && countrySearch && e.key === "+") {
                    e.preventDefault();
                    this._openDropdownWithPlus();
                    return;
                  }
                  if (strictMode) {
                    const value = this.telInput.value;
                    const alreadyHasPlus = value.charAt(0) === "+";
                    const isInitialPlus = !alreadyHasPlus && this.telInput.selectionStart === 0 && e.key === "+";
                    const isNumeric = /^[0-9]$/.test(e.key);
                    const isAllowedChar = separateDialCode ? isNumeric : isInitialPlus || isNumeric;
                    const newValue = value.slice(0, this.telInput.selectionStart) + e.key + value.slice(this.telInput.selectionEnd);
                    const newFullNumber = this._getFullNumber(newValue);
                    const coreNumber = intlTelInput2.utils.getCoreNumber(newFullNumber, this.selectedCountryData.iso2);
                    const hasExceededMaxLength = this.maxCoreNumberLength && coreNumber.length > this.maxCoreNumberLength;
                    let isChangingDialCode = false;
                    if (alreadyHasPlus) {
                      const currentCountry = this.selectedCountryData.iso2;
                      const newCountry = this._getCountryFromNumber(newFullNumber);
                      isChangingDialCode = newCountry !== currentCountry;
                    }
                    if (!isAllowedChar || hasExceededMaxLength && !isChangingDialCode && !isInitialPlus) {
                      e.preventDefault();
                    }
                  }
                }
              };
              this.telInput.addEventListener("keydown", this._handleKeydownEvent);
            }
          }
          //* Adhere to the input's maxlength attr.
          _cap(number) {
            const max = parseInt(this.telInput.getAttribute("maxlength") || "", 10);
            return max && number.length > max ? number.substr(0, max) : number;
          }
          //* Trigger a custom event on the input.
          _trigger(name, detailProps = {}) {
            const e = new CustomEvent(name, {
              bubbles: true,
              cancelable: true,
              detail: detailProps
            });
            this.telInput.dispatchEvent(e);
          }
          //* Open the dropdown.
          _openDropdown() {
            const { fixDropdownWidth, countrySearch } = this.options;
            if (fixDropdownWidth) {
              this.dropdownContent.style.width = `${this.telInput.offsetWidth}px`;
            }
            this.dropdownContent.classList.remove("iti__hide");
            this.selectedCountry.setAttribute("aria-expanded", "true");
            this._setDropdownPosition();
            if (countrySearch) {
              const firstCountryItem = this.countryList.firstElementChild;
              if (firstCountryItem) {
                this._highlightListItem(firstCountryItem, false);
                this.countryList.scrollTop = 0;
              }
              this.searchInput.focus();
            }
            this._bindDropdownListeners();
            this.dropdownArrow.classList.add("iti__arrow--up");
            this._trigger("open:countrydropdown");
          }
          //* Set the dropdown position
          _setDropdownPosition() {
            if (this.options.dropdownContainer) {
              this.options.dropdownContainer.appendChild(this.dropdown);
            }
            if (!this.options.useFullscreenPopup) {
              const inputPosRelativeToVP = this.telInput.getBoundingClientRect();
              const inputHeight = this.telInput.offsetHeight;
              if (this.options.dropdownContainer) {
                this.dropdown.style.top = `${inputPosRelativeToVP.top + inputHeight}px`;
                this.dropdown.style.left = `${inputPosRelativeToVP.left}px`;
                this._handleWindowScroll = () => this._closeDropdown();
                window.addEventListener("scroll", this._handleWindowScroll);
              }
            }
          }
          //* We only bind dropdown listeners when the dropdown is open.
          _bindDropdownListeners() {
            this._handleMouseoverCountryList = (e) => {
              var _a;
              const listItem = (_a = e.target) == null ? void 0 : _a.closest(".iti__country");
              if (listItem) {
                this._highlightListItem(listItem, false);
              }
            };
            this.countryList.addEventListener(
              "mouseover",
              this._handleMouseoverCountryList
            );
            this._handleClickCountryList = (e) => {
              var _a;
              const listItem = (_a = e.target) == null ? void 0 : _a.closest(".iti__country");
              if (listItem) {
                this._selectListItem(listItem);
              }
            };
            this.countryList.addEventListener("click", this._handleClickCountryList);
            let isOpening = true;
            this._handleClickOffToClose = () => {
              if (!isOpening) {
                this._closeDropdown();
              }
              isOpening = false;
            };
            document.documentElement.addEventListener(
              "click",
              this._handleClickOffToClose
            );
            let query = "";
            let queryTimer = null;
            this._handleKeydownOnDropdown = (e) => {
              if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  this._handleUpDownKey(e.key);
                } else if (e.key === "Enter") {
                  this._handleEnterKey();
                } else if (e.key === "Escape") {
                  this._closeDropdown();
                }
              }
              if (!this.options.countrySearch && /^[a-zA-ZÀ-ÿа-яА-Я ]$/.test(e.key)) {
                e.stopPropagation();
                if (queryTimer) {
                  clearTimeout(queryTimer);
                }
                query += e.key.toLowerCase();
                this._searchForCountry(query);
                queryTimer = setTimeout(() => {
                  query = "";
                }, 1e3);
              }
            };
            document.addEventListener("keydown", this._handleKeydownOnDropdown);
            if (this.options.countrySearch) {
              const doFilter = () => {
                const inputQuery = this.searchInput.value.trim();
                if (inputQuery) {
                  this._filterCountries(inputQuery);
                } else {
                  this._filterCountries("", true);
                }
              };
              let keyupTimer = null;
              this._handleSearchChange = () => {
                if (keyupTimer) {
                  clearTimeout(keyupTimer);
                }
                keyupTimer = setTimeout(() => {
                  doFilter();
                  keyupTimer = null;
                }, 100);
              };
              this.searchInput.addEventListener("input", this._handleSearchChange);
              this.searchInput.addEventListener("click", (e) => e.stopPropagation());
            }
          }
          //* Hidden search (countrySearch disabled): Find the first list item whose name starts with the query string.
          _searchForCountry(query) {
            for (let i = 0; i < this.countries.length; i++) {
              const c = this.countries[i];
              const startsWith = c.name.substr(0, query.length).toLowerCase() === query;
              if (startsWith) {
                const listItem = c.nodeById[this.id];
                this._highlightListItem(listItem, false);
                this._scrollTo(listItem);
                break;
              }
            }
          }
          //* Country search enabled: Filter the countries according to the search query.
          _filterCountries(query, isReset = false) {
            let noCountriesAddedYet = true;
            this.countryList.innerHTML = "";
            const normalisedQuery = normaliseString(query);
            for (let i = 0; i < this.countries.length; i++) {
              const c = this.countries[i];
              const normalisedCountryName = normaliseString(c.name);
              const countryInitials = c.name.split(/[^a-zA-ZÀ-ÿа-яА-Я]/).map((word) => word[0]).join("").toLowerCase();
              const fullDialCode = `+${c.dialCode}`;
              if (isReset || normalisedCountryName.includes(normalisedQuery) || fullDialCode.includes(normalisedQuery) || c.iso2.includes(normalisedQuery) || countryInitials.includes(normalisedQuery)) {
                const listItem = c.nodeById[this.id];
                if (listItem) {
                  this.countryList.appendChild(listItem);
                }
                if (noCountriesAddedYet) {
                  this._highlightListItem(listItem, false);
                  noCountriesAddedYet = false;
                }
              }
            }
            if (noCountriesAddedYet) {
              this._highlightListItem(null, false);
            }
            this.countryList.scrollTop = 0;
            this._updateSearchResultsText();
          }
          //* Update search results text (for a11y).
          _updateSearchResultsText() {
            const { i18n } = this.options;
            const count = this.countryList.childElementCount;
            let searchText;
            if (count === 0) {
              searchText = i18n.zeroSearchResults;
            } else if (count === 1) {
              searchText = i18n.oneSearchResult;
            } else {
              searchText = i18n.multipleSearchResults.replace("${count}", count.toString());
            }
            this.searchResultsA11yText.textContent = searchText;
          }
          //* Highlight the next/prev item in the list (and ensure it is visible).
          _handleUpDownKey(key) {
            var _a, _b;
            let next = key === "ArrowUp" ? (_a = this.highlightedItem) == null ? void 0 : _a.previousElementSibling : (_b = this.highlightedItem) == null ? void 0 : _b.nextElementSibling;
            if (!next && this.countryList.childElementCount > 1) {
              next = key === "ArrowUp" ? this.countryList.lastElementChild : this.countryList.firstElementChild;
            }
            if (next) {
              this._scrollTo(next);
              this._highlightListItem(next, false);
            }
          }
          //* Select the currently highlighted item.
          _handleEnterKey() {
            if (this.highlightedItem) {
              this._selectListItem(this.highlightedItem);
            }
          }
          //* Update the input's value to the given val (format first if possible)
          //* NOTE: this is called from _setInitialState, handleUtils and setNumber.
          _updateValFromNumber(fullNumber) {
            let number = fullNumber;
            if (this.options.formatOnDisplay && intlTelInput2.utils && this.selectedCountryData) {
              const useNational = this.options.nationalMode || number.charAt(0) !== "+" && !this.options.separateDialCode;
              const { NATIONAL, INTERNATIONAL } = intlTelInput2.utils.numberFormat;
              const format = useNational ? NATIONAL : INTERNATIONAL;
              number = intlTelInput2.utils.formatNumber(
                number,
                this.selectedCountryData.iso2,
                format
              );
            }
            number = this._beforeSetNumber(number);
            this.telInput.value = number;
          }
          //* Check if need to select a new country based on the given number
          //* Note: called from _setInitialState, keyup handler, setNumber.
          _updateCountryFromNumber(fullNumber) {
            const iso2 = this._getCountryFromNumber(fullNumber);
            if (iso2 !== null) {
              return this._setCountry(iso2);
            }
            return false;
          }
          _ensureHasDialCode(number) {
            const { dialCode, nationalPrefix } = this.selectedCountryData;
            const alreadyHasPlus = number.charAt(0) === "+";
            if (alreadyHasPlus || !dialCode) {
              return number;
            }
            const hasPrefix = nationalPrefix && number.charAt(0) === nationalPrefix && !this.options.separateDialCode;
            const cleanNumber = hasPrefix ? number.substring(1) : number;
            return `+${dialCode}${cleanNumber}`;
          }
          _getCountryFromNumber(fullNumber) {
            const plusIndex = fullNumber.indexOf("+");
            let number = plusIndex ? fullNumber.substring(plusIndex) : fullNumber;
            const selectedIso2 = this.selectedCountryData.iso2;
            const selectedDialCode = this.selectedCountryData.dialCode;
            number = this._ensureHasDialCode(number);
            const dialCodeMatch = this._getDialCode(number, true);
            const numeric = getNumeric(number);
            if (dialCodeMatch) {
              const dialCodeMatchNumeric = getNumeric(dialCodeMatch);
              const iso2Codes = this.dialCodeToIso2Map[dialCodeMatchNumeric];
              if (!selectedIso2 && this.defaultCountry && iso2Codes.includes(this.defaultCountry)) {
                return this.defaultCountry;
              }
              const alreadySelected = selectedIso2 && iso2Codes.includes(selectedIso2) && (numeric.length === dialCodeMatchNumeric.length || !this.selectedCountryData.areaCodes);
              const isRegionlessNanpNumber = selectedDialCode === "1" && isRegionlessNanp(numeric);
              if (!isRegionlessNanpNumber && !alreadySelected) {
                for (let j = 0; j < iso2Codes.length; j++) {
                  if (iso2Codes[j]) {
                    return iso2Codes[j];
                  }
                }
              }
            } else if (number.charAt(0) === "+" && numeric.length) {
              return "";
            } else if ((!number || number === "+") && !this.selectedCountryData.iso2) {
              return this.defaultCountry;
            }
            return null;
          }
          //* Remove highlighting from other list items and highlight the given item.
          _highlightListItem(listItem, shouldFocus) {
            const prevItem = this.highlightedItem;
            if (prevItem) {
              prevItem.classList.remove("iti__highlight");
              prevItem.setAttribute("aria-selected", "false");
            }
            this.highlightedItem = listItem;
            if (this.highlightedItem) {
              this.highlightedItem.classList.add("iti__highlight");
              this.highlightedItem.setAttribute("aria-selected", "true");
              const activeDescendant = this.highlightedItem.getAttribute("id") || "";
              this.selectedCountry.setAttribute("aria-activedescendant", activeDescendant);
              if (this.options.countrySearch) {
                this.searchInput.setAttribute("aria-activedescendant", activeDescendant);
              }
            }
            if (shouldFocus) {
              this.highlightedItem.focus();
            }
          }
          //* Find the country data for the given iso2 code
          //* the ignoreOnlyCountriesOption is only used during init() while parsing the onlyCountries array
          _getCountryData(iso2, allowFail) {
            for (let i = 0; i < this.countries.length; i++) {
              if (this.countries[i].iso2 === iso2) {
                return this.countries[i];
              }
            }
            if (allowFail) {
              return null;
            }
            throw new Error(`No country data for '${iso2}'`);
          }
          //* Update the selected country, dial code (if separateDialCode), placeholder, title, and active list item.
          //* Note: called from _setInitialState, _updateCountryFromNumber, _selectListItem, setCountry.
          _setCountry(iso2) {
            const { separateDialCode, showFlags, i18n } = this.options;
            const prevCountry = this.selectedCountryData.iso2 ? this.selectedCountryData : {};
            this.selectedCountryData = iso2 ? this._getCountryData(iso2, false) || {} : {};
            if (this.selectedCountryData.iso2) {
              this.defaultCountry = this.selectedCountryData.iso2;
            }
            if (this.selectedCountryInner) {
              let flagClass = "";
              let a11yText = "";
              if (iso2 && showFlags) {
                flagClass = `iti__flag iti__${iso2}`;
                a11yText = `${this.selectedCountryData.name} +${this.selectedCountryData.dialCode}`;
              } else {
                flagClass = "iti__flag iti__globe";
                a11yText = i18n.noCountrySelected;
              }
              this.selectedCountryInner.className = flagClass;
              this.selectedCountryA11yText.textContent = a11yText;
            }
            this._setSelectedCountryTitleAttribute(iso2, separateDialCode);
            if (separateDialCode) {
              const dialCode = this.selectedCountryData.dialCode ? `+${this.selectedCountryData.dialCode}` : "";
              this.selectedDialCode.innerHTML = dialCode;
              this._updateInputPadding();
            }
            this._updatePlaceholder();
            this._updateMaxLength();
            return prevCountry.iso2 !== iso2;
          }
          //* Update the input padding to make space for the selected country/dial code.
          _updateInputPadding() {
            if (this.selectedCountry) {
              const selectedCountryWidth = this.selectedCountry.offsetWidth || this._getHiddenSelectedCountryWidth();
              const inputPadding = selectedCountryWidth + 6;
              if (this.showSelectedCountryOnLeft) {
                this.telInput.style.paddingLeft = `${inputPadding}px`;
              } else {
                this.telInput.style.paddingRight = `${inputPadding}px`;
              }
            }
          }
          //* Update the maximum valid number length for the currently selected country.
          _updateMaxLength() {
            const { strictMode, placeholderNumberType, validationNumberTypes } = this.options;
            const { iso2 } = this.selectedCountryData;
            if (strictMode && intlTelInput2.utils) {
              if (iso2) {
                const numberType = intlTelInput2.utils.numberType[placeholderNumberType];
                let exampleNumber = intlTelInput2.utils.getExampleNumber(
                  iso2,
                  false,
                  numberType,
                  true
                );
                let validNumber = exampleNumber;
                while (intlTelInput2.utils.isPossibleNumber(exampleNumber, iso2, validationNumberTypes)) {
                  validNumber = exampleNumber;
                  exampleNumber += "0";
                }
                const coreNumber = intlTelInput2.utils.getCoreNumber(validNumber, iso2);
                this.maxCoreNumberLength = coreNumber.length;
                if (iso2 === "by") {
                  this.maxCoreNumberLength = coreNumber.length + 1;
                }
              } else {
                this.maxCoreNumberLength = null;
              }
            }
          }
          _setSelectedCountryTitleAttribute(iso2 = null, separateDialCode) {
            if (!this.selectedCountry) {
              return;
            }
            let title;
            if (iso2 && !separateDialCode) {
              title = `${this.selectedCountryData.name}: +${this.selectedCountryData.dialCode}`;
            } else if (iso2) {
              title = this.selectedCountryData.name;
            } else {
              title = "Unknown";
            }
            this.selectedCountry.setAttribute("title", title);
          }
          //* When the input is in a hidden container during initialisation, we must inject some markup
          //* into the end of the DOM to calculate the correct offsetWidth.
          //* NOTE: this is only used when separateDialCode is enabled, so countryContainer and selectedCountry
          //* will definitely exist.
          _getHiddenSelectedCountryWidth() {
            if (this.telInput.parentNode) {
              const containerClone = this.telInput.parentNode.cloneNode(false);
              containerClone.style.visibility = "hidden";
              document.body.appendChild(containerClone);
              const countryContainerClone = this.countryContainer.cloneNode();
              containerClone.appendChild(countryContainerClone);
              const selectedCountryClone = this.selectedCountry.cloneNode(true);
              countryContainerClone.appendChild(selectedCountryClone);
              const width = selectedCountryClone.offsetWidth;
              document.body.removeChild(containerClone);
              return width;
            }
            return 0;
          }
          //* Update the input placeholder to an example number from the currently selected country.
          _updatePlaceholder() {
            const {
              autoPlaceholder,
              placeholderNumberType,
              nationalMode,
              customPlaceholder
            } = this.options;
            const shouldSetPlaceholder = autoPlaceholder === "aggressive" || !this.hadInitialPlaceholder && autoPlaceholder === "polite";
            if (intlTelInput2.utils && shouldSetPlaceholder) {
              const numberType = intlTelInput2.utils.numberType[placeholderNumberType];
              let placeholder = this.selectedCountryData.iso2 ? intlTelInput2.utils.getExampleNumber(
                this.selectedCountryData.iso2,
                nationalMode,
                numberType
              ) : "";
              placeholder = this._beforeSetNumber(placeholder);
              if (typeof customPlaceholder === "function") {
                placeholder = customPlaceholder(placeholder, this.selectedCountryData);
              }
              this.telInput.setAttribute("placeholder", placeholder);
            }
          }
          //* Called when the user selects a list item from the dropdown.
          _selectListItem(listItem) {
            const countryChanged = this._setCountry(
              listItem.getAttribute("data-country-code")
            );
            this._closeDropdown();
            this._updateDialCode(listItem.getAttribute("data-dial-code"));
            this.telInput.focus();
            if (countryChanged) {
              this._triggerCountryChange();
            }
          }
          //* Close the dropdown and unbind any listeners.
          _closeDropdown() {
            this.dropdownContent.classList.add("iti__hide");
            this.selectedCountry.setAttribute("aria-expanded", "false");
            this.selectedCountry.removeAttribute("aria-activedescendant");
            if (this.highlightedItem) {
              this.highlightedItem.setAttribute("aria-selected", "false");
            }
            if (this.options.countrySearch) {
              this.searchInput.removeAttribute("aria-activedescendant");
            }
            this.dropdownArrow.classList.remove("iti__arrow--up");
            document.removeEventListener("keydown", this._handleKeydownOnDropdown);
            if (this.options.countrySearch) {
              this.searchInput.removeEventListener("input", this._handleSearchChange);
            }
            document.documentElement.removeEventListener(
              "click",
              this._handleClickOffToClose
            );
            this.countryList.removeEventListener(
              "mouseover",
              this._handleMouseoverCountryList
            );
            this.countryList.removeEventListener("click", this._handleClickCountryList);
            if (this.options.dropdownContainer) {
              if (!this.options.useFullscreenPopup) {
                window.removeEventListener("scroll", this._handleWindowScroll);
              }
              if (this.dropdown.parentNode) {
                this.dropdown.parentNode.removeChild(this.dropdown);
              }
            }
            if (this._handlePageLoad) {
              window.removeEventListener("load", this._handlePageLoad);
            }
            this._trigger("close:countrydropdown");
          }
          //* Check if an element is visible within it's container, else scroll until it is.
          _scrollTo(element) {
            const container = this.countryList;
            const scrollTop = document.documentElement.scrollTop;
            const containerHeight = container.offsetHeight;
            const containerTop = container.getBoundingClientRect().top + scrollTop;
            const containerBottom = containerTop + containerHeight;
            const elementHeight = element.offsetHeight;
            const elementTop = element.getBoundingClientRect().top + scrollTop;
            const elementBottom = elementTop + elementHeight;
            const newScrollTop = elementTop - containerTop + container.scrollTop;
            if (elementTop < containerTop) {
              container.scrollTop = newScrollTop;
            } else if (elementBottom > containerBottom) {
              const heightDifference = containerHeight - elementHeight;
              container.scrollTop = newScrollTop - heightDifference;
            }
          }
          //* Replace any existing dial code with the new one
          //* Note: called from _selectListItem and setCountry
          _updateDialCode(newDialCodeBare) {
            const inputVal = this.telInput.value;
            const newDialCode = `+${newDialCodeBare}`;
            let newNumber;
            if (inputVal.charAt(0) === "+") {
              const prevDialCode = this._getDialCode(inputVal);
              if (prevDialCode) {
                newNumber = inputVal.replace(prevDialCode, newDialCode);
              } else {
                newNumber = newDialCode;
              }
              this.telInput.value = newNumber;
            }
          }
          //* Try and extract a valid international dial code from a full telephone number.
          //* Note: returns the raw string inc plus character and any whitespace/dots etc.
          _getDialCode(number, includeAreaCode) {
            let dialCode = "";
            if (number.charAt(0) === "+") {
              let numericChars = "";
              for (let i = 0; i < number.length; i++) {
                const c = number.charAt(i);
                if (!isNaN(parseInt(c, 10))) {
                  numericChars += c;
                  if (includeAreaCode) {
                    if (this.dialCodeToIso2Map[numericChars]) {
                      dialCode = number.substr(0, i + 1);
                    }
                  } else {
                    if (this.dialCodes[numericChars]) {
                      dialCode = number.substr(0, i + 1);
                      break;
                    }
                  }
                  if (numericChars.length === this.dialCodeMaxLen) {
                    break;
                  }
                }
              }
            }
            return dialCode;
          }
          //* Get the input val, adding the dial code if separateDialCode is enabled.
          _getFullNumber(overrideVal) {
            const val = overrideVal || this.telInput.value.trim();
            const { dialCode } = this.selectedCountryData;
            let prefix;
            const numericVal = getNumeric(val);
            if (this.options.separateDialCode && val.charAt(0) !== "+" && dialCode && numericVal) {
              prefix = `+${dialCode}`;
            } else {
              prefix = "";
            }
            return prefix + val;
          }
          //* Remove the dial code if separateDialCode is enabled also cap the length if the input has a maxlength attribute
          _beforeSetNumber(fullNumber) {
            let number = fullNumber;
            if (this.options.separateDialCode) {
              let dialCode = this._getDialCode(number);
              if (dialCode) {
                dialCode = `+${this.selectedCountryData.dialCode}`;
                const start = number[dialCode.length] === " " || number[dialCode.length] === "-" ? dialCode.length + 1 : dialCode.length;
                number = number.substr(start);
              }
            }
            return this._cap(number);
          }
          //* Trigger the 'countrychange' event.
          _triggerCountryChange() {
            this._trigger("countrychange");
          }
          //* Format the number as the user types.
          _formatNumberAsYouType() {
            const val = this._getFullNumber();
            const result = intlTelInput2.utils ? intlTelInput2.utils.formatNumberAsYouType(val, this.selectedCountryData.iso2) : val;
            const { dialCode } = this.selectedCountryData;
            if (this.options.separateDialCode && this.telInput.value.charAt(0) !== "+" && result.includes(`+${dialCode}`)) {
              const afterDialCode = result.split(`+${dialCode}`)[1] || "";
              return afterDialCode.trim();
            }
            return result;
          }
          //**************************
          //*  SECRET PUBLIC METHODS
          //**************************
          //* This is called when the geoip call returns.
          handleAutoCountry() {
            if (this.options.initialCountry === "auto" && intlTelInput2.autoCountry) {
              this.defaultCountry = intlTelInput2.autoCountry;
              const hasSelectedCountryOrGlobe = this.selectedCountryData.iso2 || this.selectedCountryInner.classList.contains("iti__globe");
              if (!hasSelectedCountryOrGlobe) {
                this.setCountry(this.defaultCountry);
              }
              this.resolveAutoCountryPromise();
            }
          }
          //* This is called when the utils request completes.
          handleUtils() {
            if (intlTelInput2.utils) {
              if (this.telInput.value) {
                this._updateValFromNumber(this.telInput.value);
              }
              if (this.selectedCountryData.iso2) {
                this._updatePlaceholder();
                this._updateMaxLength();
              }
            }
            this.resolveUtilsScriptPromise();
          }
          //********************
          //*  PUBLIC METHODS
          //********************
          //* Remove plugin.
          destroy() {
            var _a, _b;
            const { allowDropdown, separateDialCode } = this.options;
            if (allowDropdown) {
              this._closeDropdown();
              this.selectedCountry.removeEventListener(
                "click",
                this._handleClickSelectedCountry
              );
              this.countryContainer.removeEventListener(
                "keydown",
                this._handleCountryContainerKeydown
              );
              const label = this.telInput.closest("label");
              if (label) {
                label.removeEventListener("click", this._handleLabelClick);
              }
            }
            const { form } = this.telInput;
            if (this._handleHiddenInputSubmit && form) {
              form.removeEventListener("submit", this._handleHiddenInputSubmit);
            }
            this.telInput.removeEventListener("input", this._handleInputEvent);
            if (this._handleKeydownEvent) {
              this.telInput.removeEventListener("keydown", this._handleKeydownEvent);
            }
            this.telInput.removeAttribute("data-intl-tel-input-id");
            if (separateDialCode) {
              if (this.isRTL) {
                this.telInput.style.paddingRight = this.originalPaddingRight;
              } else {
                this.telInput.style.paddingLeft = this.originalPaddingLeft;
              }
            }
            const wrapper = this.telInput.parentNode;
            (_a = wrapper == null ? void 0 : wrapper.parentNode) == null ? void 0 : _a.insertBefore(this.telInput, wrapper);
            (_b = wrapper == null ? void 0 : wrapper.parentNode) == null ? void 0 : _b.removeChild(wrapper);
            delete intlTelInput2.instances[this.id];
          }
          //* Get the extension from the current number.
          getExtension() {
            if (intlTelInput2.utils) {
              return intlTelInput2.utils.getExtension(
                this._getFullNumber(),
                this.selectedCountryData.iso2
              );
            }
            return "";
          }
          //* Format the number to the given format.
          getNumber(format) {
            if (intlTelInput2.utils) {
              const { iso2 } = this.selectedCountryData;
              return intlTelInput2.utils.formatNumber(
                this._getFullNumber(),
                iso2,
                format
              );
            }
            return "";
          }
          //* Get the type of the entered number e.g. landline/mobile.
          getNumberType() {
            if (intlTelInput2.utils) {
              return intlTelInput2.utils.getNumberType(
                this._getFullNumber(),
                this.selectedCountryData.iso2
              );
            }
            return -99;
          }
          //* Get the country data for the currently selected country.
          getSelectedCountryData() {
            return this.selectedCountryData;
          }
          //* Get the validation error.
          getValidationError() {
            if (intlTelInput2.utils) {
              const { iso2 } = this.selectedCountryData;
              return intlTelInput2.utils.getValidationError(this._getFullNumber(), iso2);
            }
            return -99;
          }
          //* Validate the input val
          isValidNumber() {
            if (!this.selectedCountryData.iso2) {
              return false;
            }
            const val = this._getFullNumber();
            const alphaCharPosition = val.search(new RegExp("\\p{L}", "u"));
            if (alphaCharPosition > -1) {
              const beforeAlphaChar = val.substring(0, alphaCharPosition);
              const beforeAlphaIsValid = this._utilsIsPossibleNumber(beforeAlphaChar);
              const isValid = this._utilsIsPossibleNumber(val);
              return beforeAlphaIsValid && isValid;
            }
            return this._utilsIsPossibleNumber(val);
          }
          _utilsIsPossibleNumber(val) {
            return intlTelInput2.utils ? intlTelInput2.utils.isPossibleNumber(val, this.selectedCountryData.iso2, this.options.validationNumberTypes) : null;
          }
          //* Validate the input val (precise)
          isValidNumberPrecise() {
            if (!this.selectedCountryData.iso2) {
              return false;
            }
            const val = this._getFullNumber();
            const alphaCharPosition = val.search(new RegExp("\\p{L}", "u"));
            if (alphaCharPosition > -1) {
              const beforeAlphaChar = val.substring(0, alphaCharPosition);
              const beforeAlphaIsValid = this._utilsIsValidNumber(beforeAlphaChar);
              const isValid = this._utilsIsValidNumber(val);
              return beforeAlphaIsValid && isValid;
            }
            return this._utilsIsValidNumber(val);
          }
          _utilsIsValidNumber(val) {
            return intlTelInput2.utils ? intlTelInput2.utils.isValidNumber(val, this.selectedCountryData.iso2, this.options.validationNumberTypes) : null;
          }
          //* Update the selected country, and update the input val accordingly.
          setCountry(iso2) {
            const iso2Lower = iso2 == null ? void 0 : iso2.toLowerCase();
            const currentCountry = this.selectedCountryData.iso2;
            const isCountryChange = iso2 && iso2Lower !== currentCountry || !iso2 && currentCountry;
            if (isCountryChange) {
              this._setCountry(iso2Lower);
              this._updateDialCode(this.selectedCountryData.dialCode);
              this._triggerCountryChange();
            }
          }
          //* Set the input value and update the country.
          setNumber(number) {
            const countryChanged = this._updateCountryFromNumber(number);
            this._updateValFromNumber(number);
            if (countryChanged) {
              this._triggerCountryChange();
            }
            this._trigger("input", { isSetNumber: true });
          }
          //* Set the placeholder number typ
          setPlaceholderNumberType(type) {
            this.options.placeholderNumberType = type;
            this._updatePlaceholder();
          }
          setDisabled(disabled) {
            this.telInput.disabled = disabled;
            if (disabled) {
              this.selectedCountry.setAttribute("disabled", "true");
            } else {
              this.selectedCountry.removeAttribute("disabled");
            }
          }
        };
        var attachUtils = (source) => {
          if (!intlTelInput2.utils && !intlTelInput2.startedLoadingUtilsScript) {
            let loadCall;
            if (typeof source === "function") {
              try {
                loadCall = Promise.resolve(source());
              } catch (error) {
                return Promise.reject(error);
              }
            } else {
              return Promise.reject(new TypeError(`The argument passed to attachUtils must be a function that returns a promise for the utilities module, not ${typeof source}`));
            }
            intlTelInput2.startedLoadingUtilsScript = true;
            return loadCall.then((module2) => {
              const utils = module2 == null ? void 0 : module2.default;
              if (!utils || typeof utils !== "object") {
                throw new TypeError("The loader function passed to attachUtils did not resolve to a module object with utils as its default export.");
              }
              intlTelInput2.utils = utils;
              forEachInstance("handleUtils");
              return true;
            }).catch((error) => {
              forEachInstance("rejectUtilsScriptPromise", error);
              throw error;
            });
          }
          return null;
        };
        var intlTelInput2 = Object.assign(
          (input, options) => {
            const iti = new Iti(input, options);
            iti._init();
            input.setAttribute("data-intl-tel-input-id", iti.id.toString());
            intlTelInput2.instances[iti.id] = iti;
            return iti;
          },
          {
            defaults: defaults2,
            //* Using a static var like this allows us to mock it in the tests.
            documentReady: () => document.readyState === "complete",
            //* Get the country data object.
            getCountryData: () => data_default,
            //* A getter for the plugin instance.
            getInstance: (input) => {
              const id2 = input.getAttribute("data-intl-tel-input-id");
              return id2 ? intlTelInput2.instances[id2] : null;
            },
            //* A map from instance ID to instance object.
            instances: {},
            attachUtils,
            startedLoadingUtilsScript: false,
            startedLoadingAutoCountry: false,
            version: "25.3.1"
          }
        );
        var intl_tel_input_default = intlTelInput2;
        return __toCommonJS(intl_tel_input_exports);
      })();
      return factoryOutput.default;
    });
  })(intlTelInput$1);
  return intlTelInput$1.exports;
}
var intlTelInputExports = requireIntlTelInput();
const intlTelInput = /* @__PURE__ */ getDefaultExportFromCjs(intlTelInputExports);
document.addEventListener("DOMContentLoaded", function() {
  const input = document.querySelector("#phone");
  if (input) {
    intlTelInput(input, {
      initialCountry: "pl",
      geoIpLookup: (callback) => {
        fetch("https://ipapi.co/json").then((res) => res.json()).then((data) => callback(data.country_code)).catch(() => callback("us"));
      },
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js"
    });
  }
});
document.querySelectorAll(".social-footer__link").forEach((link) => {
  link.addEventListener("mouseenter", () => {
    link.closest(".social-footer__item").classList.add("hovered");
  });
  link.addEventListener("mouseleave", () => {
    link.closest(".social-footer__item").classList.remove("hovered");
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector(".contacts__form");
  const popup = document.getElementById("popup");
  const popupClose = document.getElementById("popupClose");
  if (form) {
    let closePopup2 = function() {
      popup.classList.remove("popup--active");
      document.body.classList.remove("body--locked");
    };
    var closePopup = closePopup2;
    const phoneInput = form.querySelector('input[name="tel"]');
    const phoneLine = form.querySelector(".form__line--phone");
    phoneInput.addEventListener("input", function() {
      this.value = this.value.replace(/\D/g, "");
    });
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      let isValid = true;
      const phoneValue = phoneInput.value.trim();
      if (/^\d{9}$/.test(phoneValue)) {
        phoneLine.classList.remove("error");
        phoneLine.classList.add("success");
      } else {
        phoneLine.classList.remove("success");
        phoneLine.classList.add("error");
        isValid = false;
      }
      if (isValid) {
        popup.classList.add("popup--active");
        document.body.classList.add("body--locked");
        form.reset();
        phoneLine.classList.remove("success");
      }
    });
    popupClose.addEventListener("click", closePopup2);
    popup.addEventListener("click", function(e) {
      if (!e.target.closest(".popup__content")) {
        closePopup2();
      }
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && popup.classList.contains("popup--active")) {
        closePopup2();
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", function() {
  const navvControls = document.querySelector(".nav-video");
  const videoPlayer = document.getElementById("video-player");
  const playButton = document.getElementById("play");
  const pauseButton = document.getElementById("pause");
  const muteButton = document.getElementById("mute");
  const fullscreenButton = document.getElementById("fullscreen");
  muteButton.innerHTML = '<img src="assets/img/icons/sound-off.svg" alt="Mute">';
  videoPlayer.muted = true;
  videoPlayer.pause();
  playButton.style.display = "block";
  pauseButton.style.display = "none";
  navvControls.classList.remove("hidden");
  videoPlayer.addEventListener("play", function() {
    playButton.style.display = "none";
    pauseButton.style.display = "block";
    if (!videoPlayer.muted) {
      muteButton.innerHTML = '<img src="assets/img/icons/sound-on.svg" alt="Sound-on">';
    }
  });
  videoPlayer.addEventListener("pause", function() {
    playButton.style.display = "block";
    pauseButton.style.display = "none";
    if (videoPlayer.muted) {
      muteButton.innerHTML = '<img src="assets/img/icons/sound-off.svg" alt="Mute">';
    }
  });
  playButton.addEventListener("click", function() {
    videoPlayer.play();
    playButton.style.display = "none";
    pauseButton.style.display = "block";
  });
  pauseButton.addEventListener("click", function() {
    videoPlayer.pause();
    pauseButton.style.display = "none";
    playButton.style.display = "block";
  });
  muteButton.addEventListener("click", function() {
    if (videoPlayer.muted) {
      videoPlayer.muted = false;
      muteButton.innerHTML = '<img src="assets/img/icons/sound-on.svg" alt="Sound-on">';
    } else {
      videoPlayer.muted = true;
      muteButton.innerHTML = '<img src="assets/img/icons/sound-off.svg" alt="Mute">';
    }
  });
  fullscreenButton.addEventListener("click", function() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
      } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
      } else if (videoPlayer.webkitEnterFullscreen) {
        videoPlayer.webkitEnterFullscreen();
      } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  });
  const videoContainer = document.querySelector(".media-hero__video");
  const navControls = document.querySelector(".nav-video");
  let hideControlsTimeout;
  function showControls() {
    navControls.classList.remove("hidden");
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      navControls.classList.add("hidden");
    }, 2e3);
  }
  videoContainer.addEventListener("mouseenter", () => {
    navControls.classList.remove("hidden");
    clearTimeout(hideControlsTimeout);
  });
  videoContainer.addEventListener("mousemove", () => {
    showControls();
  });
  videoContainer.addEventListener("mouseleave", () => {
    navControls.classList.add("hidden");
    clearTimeout(hideControlsTimeout);
  });
  let lastTapTime = 0;
  videoContainer.addEventListener("touchstart", (e) => {
    const currentTime = (/* @__PURE__ */ new Date()).getTime();
    const tapInterval = currentTime - lastTapTime;
    if (tapInterval < 300) return;
    lastTapTime = currentTime;
    if (navControls.classList.contains("hidden")) {
      showControls();
    } else {
      navControls.classList.add("hidden");
      clearTimeout(hideControlsTimeout);
    }
  });
});
