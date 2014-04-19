/*jslint indent: 2 */
/*global window: false, document: false, chrome: false, $: false, createTag: false, createLink: false*/
(function () {
  "use strict";
  var isStarted = false;

  function createTimerLink(task, moreClass, tag) {
    var link, msg, btnText;

    if (!tag) {
      link = createLink('jira ' + moreClass);
    } else {
      link = createTag(tag, 'jira ' + moreClass);
      link.appendChild(document.createTextNode('Start timer'));
    }
    link.addEventListener("click", function (e) {
      e.preventDefault();

      if(isStarted) {
        msg = {type: 'stop'};
        btnText = 'Start timer';
      } else {
        msg = {
          type: 'timeEntry',
          description: task
        };
        btnText = 'Started...';
      }

      chrome.extension.sendMessage(msg);
      $('span', link).innerHTML = btnText;
      isStarted = !isStarted;
    });

    // new button created - reset state
    isStarted = false;

    return link;
  }

  function observeBoard() {
    var target = document.querySelector('#ghx-detail-view');
    var observer = new WebKitMutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if ($('.toggl-button')) {
          return;
        }

        var titleElem = $('dd.ghx-fieldname-summary'), numElem, title,wrapSpan, button;
        if (titleElem === null) {
          return;
        }

        numElem = $('.ghx-fieldname-issuekey a');
        title = titleElem.textContent;
        if (numElem !== null) {
          title = numElem.textContent + " " + title;
        }

        button = createTimerLink(title, 'aui-button ghx-actions aui-button-compact', 'button');
        wrapSpan = createTag('span', 'toggl-button', button.textContent);
        button.innerHTML = wrapSpan.outerHTML;
        $(".ghx-controls").insertBefore(button, $(".ghx-controls").childNodes[0]);
      });
    });
    var config = {childList: true, subtree: true};
    observer.observe(target, config);
  }

  function addLinkToDiscussion() {
    var titleElem = $('#summary-val'), numElem, title, wrapUl, wrapLi, wrapSpan, a;
    if (titleElem === null) {
      return;
    }

    numElem = $('#key-val');
    title = titleElem.textContent;
    if (numElem !== null) {
      title = numElem.textContent + " " + title;
    }

    wrapUl = createTag('ul', 'toggl toolbar-group');
    wrapLi = createTag('li', 'toolbar-item');
    wrapUl.appendChild(wrapLi);

    a = createTimerLink(title, 'button toolbar-trigger');
    wrapSpan = createTag('span', 'toggl-button', a.textContent);
    a.innerHTML = wrapSpan.outerHTML;
    wrapLi.appendChild(a);
    $(".command-bar .toolbar-split-left").appendChild(wrapUl);
  }

  chrome.extension.sendMessage({type: 'activate'}, function (response) {
    if (response.success) {
      if ($('#gh')) {
        observeBoard();
      } else {
        addLinkToDiscussion();
      }
    }
  });

}());
