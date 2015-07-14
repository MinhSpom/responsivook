/*!
 * responsivook.js(https://github.com/tategakibunko/responsivook)
 * Copyright Masaki WATANABE
 * Licensed under MIT
 */
var Responsivook = (function(){
  var _targets = [];

  var _get_default_font_size = function(height){
    return Math.floor(height / (22 + 2.5));
  };

  var _get_default_height_landscape = function(){
    return Math.floor(screen.height * 60 / 100);
  };

  var _get_default_height_portrait = function(){
    return Math.floor(screen.height * 55 / 100);
  };

  var _get_default_height = function(){
    return (screen.width > screen.height)?
      _get_default_height_landscape(): _get_default_height_portrait();
  };

  var _resize_timer;
  window.addEventListener('resize', function(evt){
    clearTimeout(_resize_timer);
    _resize_timer = setTimeout(function(){
      var event;
      if(window.CustomEvent){
	event = new CustomEvent("resized", {detail: {}});
      } else {
	event = document.createEvent('CustomEvent');
	event.initCustomEvent("resized", true, true, {});
      }
      document.dispatchEvent(event);
    }, 250);
  });

  var _create_button = function(label, color){
    var button = document.createElement("button");
    button.className = ["responsivook-btn", "btn", "icon-only", color].join(" ");
    button.innerHTML = label;
    return button;
  };

  var _create_pager = function(target){
    var div = document.createElement("div");
    div.className = "responsivook-pager";
    var left = _create_button(target.leftLabel, target.leftColor);
    var right = _create_button(target.rightLabel, target.rightColor);
    div.appendChild(left);
    div.appendChild(right);
    return {
      element:div,
      left:left,
      right:right
    };
  };

  var _create_screen = function(target){
    var wrap = document.createElement("div");
    wrap.className = "nehan-wrap";
    wrap.style.width = target.width + "px";
    wrap.style.height = target.height + "px";
    wrap.style.backgroundColor = target.backgroundColor;
    wrap.style.color = target.color;
    var pe = Nehan.createPagedElement().setStyle("body", {
      flow:target.flow,
      fontSize:target.fontSize,
      fontFamily:target.fontFamily,
      width:target.pageWidth,
      height:target.pageHeight,
      oncreate:function(ctx){
	setTimeout(function(){
	  ctx.dom.classList.add("fadein");
	}, 10);
      }
    }).setContent(target.html);
    var pe_element = pe.getElement();
    pe_element.className = "nehan-wrap-content";
    pe_element.style.padding = [
      target.fontSize + "px",
      target.fontSize + "px",
      Math.floor(1.5 * target.fontSize) + "px"
    ].join(" ");
    wrap.appendChild(pe_element);
    return {
      element:wrap,
      pages:pe
    };
  };

  var _create_on_click_pager = function(pages, type){
    return (type === "next")? function(){
      pages.setNextPage();
      return false;
    } : function(){
      pages.setPrevPage();
      return false;
    };
  };

  var _insert_after = function($target, $ins_node){
    var $parent = $target.parentNode;
    var $next = $target.nextSibling;
    if($next && $next.classList && $next.classList.contains("responsivook")){
      $parent.removeChild($next);
      $next = $target.nextSibling;
    }
    $parent.insertBefore($ins_node, $next);
  };

  var _start_book = function(target){
    var $book = document.createElement("div");
    $book.className = "responsivook";
    var screen = _create_screen(target);
    var pager = _create_pager(target);
    $book.appendChild(screen.element);
    $book.appendChild(pager.element);
    pager.left.onclick = _create_on_click_pager(screen.pages, target.leftType);
    pager.right.onclick = _create_on_click_pager(screen.pages, target.rightType);
    _insert_after(target.$dom, $book);
    return $book;
  };

  var _start_books = function(targets, on_complete){
    targets.forEach(_start_book);
    if(on_complete && typeof on_complete === "function"){
      on_complete();
    }
  };

  var _get_page_width = function(width, font_size){
    return width - font_size * 2;
  };

  var _get_page_height = function(height, font_size){
    return height - Math.floor(2.5 * font_size);
  };

  var _check_resize = function(target){
    var $parent = target.$dom.parentNode;
    return target.width !== $parent.offsetWidth;
  };

  var _resize_page_size = function(target){
    var $parent = target.$dom.parentNode;
    target.width = $parent.offsetWidth;
    target.pageWidth = _get_page_width(target.width, target.fontSize);
    return target;
  };

  var _create_html = function(html, on_html){
    var result = html
      .replace(/\[ruby\s+(.*?)\s+(.*?)\]/g, "<ruby>$1<rt>$2</rt></ruby>")
      .replace(/\[page-break\](\n|<br>)*/g, "<page-break>")
    ;
    if(on_html && typeof on_html === "function"){
      result = on_html(result);
    }
    return result;
  };

  var _create_target = function($dom, opt){
    var raw_html = $dom.innerHTML;
    var html = _create_html(raw_html, opt.onHtml || null);
    var flow = opt.flow || "tb-rl";
    var color = opt.color || "#444";
    var background_color = opt.backgroundColor || "#eee";
    var width = $dom.offsetWidth;
    var height_draft = Math.max(200, opt.height || _get_default_height());
    var font_size = Math.max(12, opt.fontSize || _get_default_font_size(height_draft));
    var height = font_size * Math.floor(height_draft / font_size);
    var font_family = opt.fontFamily || "'ヒラギノ明朝 Pro W3','Hiragino Mincho Pro','HiraMinProN-W3','IPA明朝','IPA Mincho', 'Meiryo','メイリオ','ＭＳ 明朝','MS Mincho'";
    var page_width = _get_page_width(width, font_size);
    var page_height = _get_page_height(height, font_size);
    var is_left_next = flow === "tb-rl";
    var left_color = opt.leftColor || "dark-blue";
    var right_color = opt.rightColor || "red";
    var left_label = opt.leftLabel || "&#9664;";
    var right_label = opt.rightLabel || "&#9654;";
    var left_type = is_left_next? "next" : "prev";
    var right_type = is_left_next? "prev" : "next";
    return {
      $dom:$dom,
      html:html,
      flow:flow,
      color:color,
      backgroundColor:background_color,
      width:width,
      height:height,
      pageWidth:page_width,
      pageHeight:page_height,
      fontSize:font_size,
      fontFamily:font_family,
      leftColor:left_color,
      rightColor:right_color,
      leftLabel:left_label,
      rightLabel:right_label,
      leftType:left_type,
      rightType:right_type
    };
  };

  return {
    start: function(path, args){
      var opt = args || {};
      var on_complete = opt.onComplete || null;

      _targets = Array.prototype.map.call(document.querySelectorAll(path), function($dom){
	var cache = _create_target($dom, opt);
	$dom.style.display = "none";
	return cache;
      });

      _start_books(_targets, on_complete);

      document.addEventListener("resized", function(event){
	var updated_targets = _targets.filter(_check_resize).map(_resize_page_size);
	_start_books(updated_targets, on_complete);
      });
    }
  };
})();