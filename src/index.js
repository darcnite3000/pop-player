/* global jQuery */
const $ = jQuery
const imageFolder = 'images/'
const siteId = 170
const joinLink = {
  default: `https://test.com/signup/signup.php?s=${siteId}`,
  mobile: `https://test.com/signup/signup.php?s=${siteId}&cp=iphone&mobile_site=1`
}

function joinLinks (cssClass = 'join-link', joinLink = joinLink) {
  $(`.${cssClass}`)
    .filter((i, el) => !$(el).hasClass(`${cssClass}ed`))
    .each((i, el) => {
      const lb = $(el)
      lb.addClass(`${cssClass}ed`)
        .attr('href', joinLink.default)
        .on('mobilify', e => {
          lb.attr('href', joinLink.mobile ? joinLink.mobile : joinLink.default)
        })
        .on('desktopify', e => {
          lb.attr('href', joinLink.default)
        })
    })
}

class PopPlayer {
  playerParentClass = 'views-row'
  playerClass = 'pop-player'
  parentElem = `.${this.playerParentClass}`
  elem = `${this.parentElem} .${this.playerClass}`
  completeClass = 'player-setup'
  playerScript = 'https://httpbin.org/get'

  visible = false
  overlay = this.setupOverlay()
  currQuality = this.getAutoQuality()

  videoLink ({ nid }, qual = 'hi') {
    return `${this.playerScript}?nid=${nid}&qual=${qual}`
  }
  makePlayerLink ({ title, nid }) {
    const playerLinkImg = $(
      `<img src="${imageFolder}videooverlay.png" alt="Play ${title}">`
    )
    playerLinkImg.css({ width: '100%', height: '100%' })

    const playerLink = $(
      `<a href="${this.videoLink({
        nid
      })}" title="Play ${title}" class="pop-player-link"></a>`
    )
    playerLink.append(playerLinkImg)
    playerLink.css({
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    })
    return playerLink
  }

  getMetaData (element) {
    const player = $(element)
    const parent = player.closest(this.parentElem)
    const nid = parent
      .find('.nid')
      .first()
      .text()
      .trim()
    const title = parent
      .find('.title')
      .first()
      .text()
      .trim()
    return {
      nid,
      title,
      player
    }
  }
  makeOverlay () {
    const container = $(`<div class="${this.playerClass}-container"></div>`)
    const content = $(`<div class="${this.playerClass}-content"></div>`)
    const playerWrap = $(`<div class="${this.playerClass}-player"></div>`)
    const playerScaler = $(
      `<img class="${
        this.playerClass
      }-scaler" src="${imageFolder}playerscaler.gif" alt="">`
    )
    const iframe = $(`<iframe
      src=""
      class="${this.playerClass}-iframe"
      allowfullscreen
      frameborder="0"
    ></iframe>`)
    playerWrap.append(playerScaler).append(iframe)
    const controls = $(`<div class="${this.playerClass}-controls"></div>`)
    const close = $(
      `<a href="#" class="${
        this.playerClass
      }-close play-close" aria-label="close player"><span class="fa-stack fa-lg"><i class="fa fa-fw fa-stack-2x fa-circle"></i><i class="fa fa-fw fa-stack-1x fa-times fa-inverse"></i></span></a>`
    )
    content
      .append(playerWrap)
      .append(controls)
      .append(close)
    container.append(content)
    container.on('click', '.play-close', () => this.hidePopPlayer())
    $('body').append(container)
    container.hide()
    this.visible = false
    return {
      container,
      content,
      controls,
      iframe
    }
  }
  setupOverlay () {
    const container = $(`.${this.playerClass}-container`)
    if (container.length !== 0) {
      const content = container.find(`.${this.playerClass}-content`)
      const iframe = container.find(`.${this.playerClass}-iframe`)
      const controls = container.find(`.${this.playerClass}-controls`)
      container.hide()
      this.visible = false
      return {
        container,
        content,
        controls,
        iframe
      }
    } else {
      return this.makeOverlay()
    }
  }
  makePlayerButton (metaData, content, qual) {
    const link = this.videoLink(metaData, qual)
    const active = qual === this.currQuality ? 'active' : ''
    const button = $(
      `<a href="${link}" data-qual=${qual} class="play-link ${active}">${content}</a>`
    )
    button.click(event => {
      event.preventDefault()
      this.currQuality = qual
      this.updateActivePlayButtons()
      this.overlay.iframe.attr('src', link)
    })
    return button
  }
  getAutoQuality () {
    return $(document).width() < 500 ? 'low' : 'hi'
  }
  updateActivePlayButtons () {
    this.overlay.controls
      .find('.play-link')
      .removeClass('active')
      .filter(`[data-qual=${this.currQuality}]`)
      .addClass('active')
  }
  showPopPlayer (metaData) {
    this.currQuality = this.getAutoQuality()
    this.overlay.iframe.attr('src', this.videoLink(metaData, this.currQuality))
    if ($('body').hasClass('not-logged-in')) {
      this.overlay.controls.append(
        '<a href="#" class="join-link">JOIN NOW!</a>'
      )
      joinLinks('join-link', joinLink)
    } else {
      const playLow = this.makePlayerButton(metaData, 'Play Low', 'low')
      const playMed = this.makePlayerButton(metaData, 'Play Med', 'med')
      const playHigh = this.makePlayerButton(metaData, 'Play High', 'hi')
      this.overlay.controls
        .empty()
        .append(playLow)
        .append(playMed)
        .append(playHigh)
        .append('<a href="#" class="play-close">Close Player</a>')
    }
    this.visible = true
    this.overlay.container.show()
  }
  hidePopPlayer () {
    this.visible = false
    this.overlay.container.hide()
    this.overlay.controls.empty()
    this.overlay.iframe.attr('src', '')
  }
  setupPlayers (callback = f => f) {
    const players = $(this.elem)
      .filter((i, el) => !$(el).hasClass(this.completeClass))
      .each((i, el) => {
        const metaData = this.getMetaData(el)
        const playerLink = this.makePlayerLink(metaData)
        playerLink.click(event => {
          event.preventDefault()
          if (!this.visible) {
            this.showPopPlayer(metaData)
          }
        })
        metaData.player.css({ position: 'relative' })
        metaData.player.append(playerLink).addClass(this.completeClass)
      })
    callback(players)
    return players
  }
}

$(() => {
  const popPlayers = new PopPlayer()
  popPlayers.setupPlayers()
})
