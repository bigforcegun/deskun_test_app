(( $,_ ,EJS) ->
  class window.adminSimpleApp
    @ws: null;
    @wsUrl: "ws://localhost:4000/backend/images";
    @timeoutId: null;
    @reconnectDelay: 5000;
    @imagesOnPage:10
    #@imagePrefix: '/uploads/images/';
    @$container:null
    @ui:
      container:'#images-list'
      item:'.media'
      warning:'#connection-warning'
    @templates:
      imageItem:'/javascripts/templates/image_item.ejs'

    @init:()->
      @prepareTemplates()
      @initView()
      @createWs()

    @prepareTemplates:()->
      _.each(@templates,
        (url, key)->
          @templates[key] = new EJS(url: url)
        , @)

    @createWs:()->
      self = @
      delete @ws
      @ws = new WebSocket(@wsUrl);
      @ws.onopen = ()->
        self.onWsOpen();

      @ws.onmessage = (e)->
        self.onWsMessage(e);

      @ws.onclose = () ->
        self.onWsClose();

      @ws.onerror = (err)->
        #console.error('Socket encountered error: ', err.message, 'Closing socket')
        #self.ws.close()


    @onWsOpen:()->
      console.log("Successfully connect!")

      @stopTryReconnect()
      @loadInitialData()

    @onWsMessage:(e)->
      try
        messageOjb = JSON.parse(e.data)
        @processMessage(messageOjb)
      catch error
        console.log(error)

    @onWsClose:()->
      console.log("Connection closed!")
      @startTryReconnect()

    @tryReconnect:()->
      console.log("Trying to reconnect to WS at #{@wsUrl}")
      @createWs();

    @startTryReconnect:()->
      @$warning.show();
      console.log("Trying to reconnect to WS through #{@reconnectDelay} ms")
      self = @
      @timeoutId = setTimeout(
        ()->
          self.tryReconnect();
      ,@reconnectDelay)

    @stopTryReconnect:()->
      @$warning.hide();
      clearTimeout(@timeoutId)

    @loadInitialData:()->
      action = 'get_list'
      self = @
      # Боремся с задержкой сокета после реконнекта таким костылем
      setTimeout(
          ()->
            console.log('ТУТ пашет')
            self.ws.send(action)
        ,100)

    @processMessage:(messageOjb)->
      console.log(messageOjb)
      switch messageOjb.action
        when 'upload' then @processNewPhoto(messageOjb.record)
        when 'list' then @processNewPhotos(messageOjb.records)


    @processNewPhotos:(images)->
      @$container.empty()
      _.each(images.reverse(),
        (image)->
          @processNewPhoto(image)
        ,@)

    @processNewPhoto:(image)->
      $newItem = $(@templates.imageItem.render(
        image:image
      ))
      $newItem.hide()
      @$container.prepend($newItem);
      $newItem.slideDown('slow');
      @updateContainer();

    @updateContainer:()->
      $("#{@ui.item}:gt(#{@imagesOnPage - 1})",@$container).slideUp("slow",()->
        $(this).remove()
      );


    @initView:()->
      @$container = $(@ui.container)
      @$warning = $(@ui.warning)


  adminSimpleApp.init();

)( $, _, EJS )





