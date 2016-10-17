define(
  'ephox.alloy.sliding.SlidingHeight',

  [

  ],

  function () {
    var closedStyle = Styles.resolve('toolbar-more-closed');
    var openStyle = Styles.resolve('toolbar-more-open');
    var hideStyle = Styles.resolve('toolbar-more-hide');
    var showStyle = Styles.resolve('toolbar-more-show');

    var setAndReflow = function (e, height) {
      Css.set(e, 'height', height + 'px');
      Css.reflow(e);
    };

    var hideMore = function (e) {
      Class.remove(e, openStyle);
      Class.add(e, closedStyle);
      setAndReflow(e, 0);
    };

    var showMore = function (e) {
      Class.remove(e, closedStyle);
      Class.add(e, openStyle);
      Css.remove(e, 'height');
    };

    return function (element) {
      hideMore(element);

      var showing = false;

      // Hiding is easy.
      var hide = function () {
        showing = false;
        setAndReflow(element, Height.get(element));   // force current height to begin transition
        Class.add(element, hideStyle);                // enable transitions
        hideMore(element);                            // set hidden
      };

      // Showing is complex due to the inability to transition to "auto".
      // We also can't cache the height as the editor may have resized since it was last shown.
      var show = function () {
        showMore(element);                        // show (temporarily)
        var moreHeight = Height.get(element);     // measure height
        hideMore(element);                        // hide again
        Class.add(element, showStyle);            // enable transitions
        showMore(element);                        // show
        setAndReflow(element, moreHeight);        // We can't transition to "auto", force desired size, heightHandler will remove
        showing = true;
      };

      var heightHandler = DomEvent.bind(element, 'transitionend', function (event) {
        // This will fire for all transitions, we're only interested in the height completion
        if (event.raw().propertyName === 'height') {
          Classes.remove(element, [showStyle, hideStyle]); // disable transitions immediately (Safari animates the height removal below)
          if (showing) Css.remove(element, 'height');      // when showing, remove the height so it is responsive
        }
      });

      var visible = function () {
        return showing;
      };

      var destroy = function () {
        heightHandler.unbind();
      };

      return {
        visible: visible,
        hide: hide,
        show: show,
        destroy: destroy
      };

    };
  }
);