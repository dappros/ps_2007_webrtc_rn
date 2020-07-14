
function printloadconfirmation (loadid)
{ 
    window.open('load.php?edit='+loadid+'&print=confirmation')
}
function printinvoice(loadid)
{
    window.open('load.php?edit='+loadid+'&print=invoice')
}
function cookie_set(cname, cvalue, exdays) 
{
    var d = new Date();
    if(exdays!='')
    {
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
    }
    var expires = "expires="+ d.toUTCString();
    
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    console.log("cooke",document.cookie );
} 

function cookie_delete(cname) { 
    var expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = cname + "=;" + expires + ";path=/";
} 
function cookie_get(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
} 
datafield=false;
function updatefield_init(selector)
{
    //this is called from object.php and objects.php to initialize all of the data fields.
    if(typeof selector === 'undefined')
        selector = 'select:not(.updatefield-none), input:not(.updatefield-none), textarea:not(.updatefield-none)';
    $('.updatefield').find(selector).change(function(){
        var obj = $(this)
        var name = obj.attr('name')
        console.log(name);
       	var frm = obj.closest('form');
        console.log(frm);
       	var row = obj.closest('tr');
       	var table = obj.closest('table');
       	var td = obj.closest('td');
       	var th = obj.closest('th');
        if(obj.hasClass('updatefield-none') || !name)
        {
          //  alert('confirming that the updatefield-none class was added after documenr ready')
            return;
        }
//        console.log('th1', $(th).data('objectid'));
//        console.log('th2', $(th).html());
//
//        console.log('td1', $(td).data('objectid'));
//        console.log('td2', $(td).html());

        var id;
        var parent
        if(typeof(td.data('objectid')) != 'undefined' && td.data('objectid') !=null)
            parent=td;
        else if(typeof(th.data('objectid')) != 'undefined' && td.data('objectid') !=null)
            parent=th;
        else if(typeof(row.data('objectid')) != 'undefined' && row.data('objectid') !=null)
            parent=row;
        else if(typeof(table.data('objectid'))!='undefined' && table.data('objectid') !=null)
            parent=table;
        else if(typeof(frm.data('objectid')) != 'undefined'  && frm.data('objectid') !=null)
            parent=frm;
        else
        {
            alert('update field for '+obj.attr('name')+' does not have an objectid from form, table, row or td')
            return
        }
        if(typeof(parent.data('objecttype'))!='undefined')
            type=parent.data('objecttype')
        else if(typeof(td.data('objecttype'))!='undefined')
            type=td.data('objecttype')
        else if(typeof(th.data('objecttype'))!='undefined')
            type=th.data('objecttype')        
        else if(typeof(row.data('objecttype'))!='undefined')
            type=row.data('objecttype')
        else if(typeof(table.data('objecttype'))!='undefined')
            type=table.data('objecttype')
        else if(typeof(frm.data('objecttype'))!='undefined')
            type=frm.data('objecttype')
        else
        {
             type = frm.find('input[name=objecttype]').val();
             if(!type)
             {
                alert('update field  no data-objecttype found')
                return
             }
        }
        id = parent.data('objectid') 
        if(!name)
        {
            alert('update field does not have a name attribute on the object - updatefield-none?   or add a name? \n the problem object has been logged to the console')
            console.log("updatefield error object",obj)
            return;
        }
        if( !id )
        {
            alert('update field does not have an id - problem with the containing elements that should have data-objectid on them ((form, table, tr, td)');
            return;
        }
        if(!type)
        {  
            alert('update field does not have a type - problem with the containing elements at should have a data-objecttype on them (form, table, tr, td)')
            return;
        }
        datafield='objectid';
        if(name.indexOf('address')==0)
            datafield='addressid'; 
        if(name.indexOf('phone')==0)
            datafield='phoneid'; 
        var updatefield = parent.data(datafield);
        var value = obj.val();
    	console.log('updatefield id:'+id+' value:'+value);
        if(obj.attr('type')=='checkbox' && !obj.is(':checked'))
            value=0;
        var url = 'object.php?type='+type+'&id='+id+'&field='+name+'&value='+encodeURIComponent(value)+ '&updatefield='+updatefield;
        updatefield_fromurl(url,obj,parent);   //app.js
    })
}


function updatefield_fromurl(url,obj,parentselector,data) //parentselectory and data are optional
{ 
    $.each($('.updatefield-failure'),function(index, object) {
        $(object).removeClass('updatefield-failure')
    });
    $.each($('.updatefield-success'),function(index, object) {
        $(object).removeClass('updatefield-success')
    });
    $.each($('.updatefield-messagediv'),function(index, object) {
        $(object).remove();
    });
    var updatefieldurl = url 
    var method = "GET";
    if(data) 
    {
        method="POST";
        console.log("processing.1",fn)
    } 
    var processing = $(obj).data('updatefield_fromurl_processing');
    if(processing)
    {
        var timeout = $(obj).data('updatefield_fromurl_timeout')
        if(timeout>0)
        {
            console.log("Clearing Timeout"+timeout);
            clearTimeout(timeout);
        }
        
        var timeout =  setTimeout(function(){    updatefield_fromurl(url,obj,parentselector,data) },100);
        
        console.log("Setting Timeout"+timeout);
        $(obj).data('updatefield_fromurl_timeout', timeout);
        return;
    }
       
    $(obj).data('updatefield_fromurl_processing',true)
    console.log("processingc",updatefieldurl)  
    $.ajax({
    	'url': updatefieldurl
        , 'method':method
        , 'data': data
		, 'fail': function(ret)
		{   
		    $(obj).data('updatefield_fromurl_processing',false)
			updatefield_fromurl_error(obj, parentselector, ret)
		}
        , 'always': function(ret)
		{     
		    $(obj).data('updatefield_fromurl_processing',false)
			updatefield_fromurl_error(obj, parentselector, ret)
		}
		, 'success': function(ret)
		{   
                    $(obj).data('updatefield_fromurl_processing',false)
                    var err = false
                    if(ret.toLowerCase().indexOf('error')>=0)
                            err = true
                    if(ret.toLowerCase().indexOf('die:')>=0)
                            err = true
                    if(ret.toLowerCase().indexOf('fail')>=0)
                            err = true
                    if(ret.toLowerCase().indexOf('forcedisplay')>=0)
                            err = true
                    if(err) 
                    { 
                            updatefield_fromurl_error(obj, parentselector, ret)
                    }
                    else
                    {
                        if(obj.hasClass('objectform-reloadfield'))
                        {
                            var frm = $(parentselector).closest('form');
                            var reloadinput = document.createElement('input');
                            reloadinput.setAttribute('type', 'hidden');
                            reloadinput.setAttribute('name', 'formreload');
                            reloadinput.setAttribute('value', $(obj).attr('name'));
                            frm.append(reloadinput);
                            $(frm).submit();
                            return;
                        }
                        else
                            obj.addClass('updatefield-success');
                    }
		}
    })
}
function updatefield_fromurl_error(obj,parentselector,ret)
{ 
    if(ret.responseText)
        ret = ret.responseText;
    try
    { 
        var errors = JSON.parse(ret);
        var objerror = errors[obj.attr('name')]; 
        if(obj.attr('erroroutput') && objerror === undefined)
        {
            obj = $(obj).closest(parentselector).find(obj.attr('erroroutput')); ;
            obj.addClass('updatefield-success') 
        }
        for(var field in errors)
        {
            var fieldobj = $(obj).closest(parentselector).find('[name=\"'+field+'\"]'); 
            if(fieldobj.attr('erroroutput'))
            {
                    fieldobj = $(obj).closest(parentselector).find(fieldobj.attr('erroroutput')); ;
            }
            fieldobj.addClass('updatefield-failure');
            fieldobj.after("<div class='updatefield-messagediv'>"+errors[field]+ "</div>");
        }
    }catch(e)
    { 
        obj.addClass('updatefield-failure'); 
        obj.after("<div class='updatefield-messagediv'>"+ret+"</div>");
    }
}
function init_selfcontained_ui()
{
	
	// this will take any element that has a class of selfcontained-ui and hijack it to post to itself
	$(".selfcontained-ui").find("form").on("submit",function(event){
		
		event.preventDefault();
		var data=$(this).serialize()
		var posturl=$(this).attr('action');
		if(!posturl)
			posturl="?";
		
		that=$(this)
		$.post(posturl,data,function(response){
			
			if(!$(that).find('.form-notice').length)
				{
					$(that).prepend("<div class='form-notice'></div>")
				}
			$(that).find('.form-notice').html(response);	
			
		})
		
		
	})
	
	
	
}
function fixheaderonscroll()
{
	$(window).scroll(function(){
	
		console.warn($(window).scrollTop())
		if($(window).scrollTop()>50)
			  $("header.header-fixed").css({
					'overflow': 'hidden'
				})
			else
				$("header.header-fixed").css({
					'overflow': 'visible'
				})
			})
}
		
//todo // need to get rid of this from app.js.

document.addEventListener("DOMContentLoaded", function()
{ 
	if($("#loadlist").length)
	$("#loadlist").DataTable({
		"columnDefs": [
			{ "orderable": false, "targets":[0] }
		],
	    order: [[1, 'desc']]
	}); 
	if($("#userlist").length)
		$("#userlist").DataTable({
 			"columnDefs": [
				{ "orderable": false, "targets":[0,1] }
			],
			order: [[3, 'desc']]
		}); 

	
	// make sure the drop menu is able to be clicked from the lis
	$(".menuwrap ul.menu>li>ul>li").click(function(event){
		if($(this).find("a").length)
		{
			hreftogo=$(this).find("a").attr('href');
			window.location.href=hreftogo
		}
	
	
	})
//	$(".menuwrap ul.menu>li").click(function(event){
//		if($(this).find("a").length)
//		{
//			hreftogo=$(this).find("a").attr('href');
//			window.location.href=hreftogo
//		}
//	
//	
//	})	
	// alert("page ready")
	// set submit and cancel buttons to be clickable outside of text
	$("div[btn-icon]").click(function(event){
              
	    if($(this).hasClass('no-hijack'))
	      return true;
		if($(event.target).attr("type")=="submit") // this will keep the endless loop from running against the click
			return;
		$(this).find("input[type=submit]").click();
		$(this).css({
			"outline": "5px auto -webkit-focus-ring-color",
			"outline-offset":" -2px"
		})
		$(this).find("input[type=submit]").css({
			"outline": "none",
			"outline-offset":" 0"
		})
	})

	if($(".dashboard-menu").length)
    {
	    // this will handle the side bar when it exists and always make sure it stretches the entire height of the page
		
		$('body').on('change',setdashboardmenuheight());
		$('body').on('click',setdashboardmenuheight());
	}
	

	
		
		// tool tips
	$(".help-tooltip").hover(function(){
			//$(this).find(".innercontent").addClass("tooltip-open")
			$(this).find(".innercontent").addClass('tooltip-open');
		},function(){
			$(this).find(".innercontent").removeClass("tooltip-open")	
			
			})
	
	
});


function manage_viewport_units()
{
	return;
	var ua=navigator.userAgent
	
	if(ua.indexOf("Safari")>0)
	{
		var viewportWidth = $(window).width();
		
		// Adds element for visual conformation of varible change
		$('body').prepend('<span class="port-size">Viewport Width: ' + viewportWidth + '</span>');
		// Adds style element to add CSS to base the REM unit off of
		$('head').append('<style class="viewport-css"></style>');
		// Adds CSS into the style element
		$('style.viewport-css').text('html {font-size:' + viewportWidth + 'px;}');
		// Changes CSS variable and style when resized
		$(window).resize(function() {
		  var viewportWidth = $(window).width();
		  $('style.viewport-css').text('html {font-size:' + viewportWidth + 'px;}');
		  $('.port-size').text('Viewport Width: ' + viewportWidth + 'px');
		});
	}
	
	
}

function init_panels()
{
	var panels=$j("[panel]");
	$j.each(panels,function(pi,po)
	{
		var heading=$j(po).find("[panel-title]");
		var hidebutton="<div class='panelclose' >&times;</div>";
		
		var headclone=$j(heading).clone();
		$j(heading).remove();
		var pcontent=$j(po).html();
		$j(po).html("<div class='panel-hideable-content'>"+pcontent+"</div>");
		$j(po).prepend(headclone)
		$j(po).find("[panel-title]").append(hidebutton);
		$j(po).find(".panelclose").click(function() 
		{
			var tt=$j(po);
			var hideablecontent=tt.closest('[panel]').find('.panel-hideable-content')
			if($j(hideablecontent).is(":visible"))
			{
				$j(hideablecontent).hide()
			} 
			else
			{
				$j(hideablecontent).show()
			}
		})
	})
}
function init_tabbedpanels(activetabbedpanel)
{
	var tpgexists=$(".tabbed-panel-container").length
	if(!tpgexists)
		return;
	var tpg=$(".tabbed-panel-container");
	
	$.each($(tpg),function(tpgi,tpgo)
	{
		var tps=$(tpgo).find("[tabbed-panel]");
		var tpsgroupname=$(tpgo).attr("tp-groupname")
		$(tpgo).prepend("<div tp-grouptabs tp-gt-name='"+tpsgroupname+"' ></div>");
		var tabcnt=0;
		$.each($(tps),function(tpsi,tpso)
		{
			var tptabname=$(tpso).attr('tp-name');
			var tptablabel=$(tpso).attr('tp-label');
			var tpopencallback=$(tpso).attr('tp-opencallback');
			var activetabclass='';
			var activetabbedpanelclass='';
			switch (true)
			{
				case (typeof activetabbedpanel == 'undefined'):
				case (activetabbedpanel.trim() == ''):
					if (tabcnt > 0) break; // if this is the case the first tab is the default tab
				case (activetabbedpanel == tptabname):
					activetabclass='tab-active';
					activetabbedpanelclass="tabbed-panel-active";
			}
			$(tpso).addClass(activetabbedpanelclass);
			var thistabhtml="<div class='"+activetabclass+"' tp-tab tp-tab-name='"+tptabname+"' onclick=\""+tpopencallback+"\" >"+tptablabel+"</div>";
			$(tpso).closest('.tabbed-panel-container').find(".tabbed-panel-tabgroup").append(thistabhtml);
			$(tpso).hide();
			$(tpso).closest('.tabbed-panel-container').find(".tabbed-panel-active").show();
			tabcnt++;
		});
	});
	
	$(".tabbed-panel-container").find('.tabbed-panel-tabgroup').find("[tp-tab]").click(function(){
		var tpname=$(this).attr("tp-tab-name");
		var closesttabgroup=$(this).closest(".tabbed-panel-container");
		$(closesttabgroup).find(".tab-active").removeClass("tab-active")
		$(this).addClass("tab-active");
		$(closesttabgroup).find("[tabbed-panel].tabbed-panel-active").removeClass('tabbed-panel-active');
		$(closesttabgroup).find("[tabbed-panel]").hide();
		$(closesttabgroup).find("div[tp-name='"+tpname+"']").show().addClass('tabbed-panel-active');
	});
	
}

function set_search_columns(){
	
	$($("table").find("thead tr")[0]).after("<tr  id='dt-searchrow'></tr>")
		$.each($("table").find("tbody tr td"),function(){
			if($(this).text()!='' || $(this).find("input").length==0)
				$("#dt-searchrow").append("<td><input onkeyup='columnsearch(this)' type=text name=search[] /></td>")
		})
	
}
function columnsearch(col)
{
	var indy=$(col).parent().index()
	var stext=$(col).val()
	$.each($("table").find("tbody tr td"),function(){
		var thisindy=$(this).index()	
		if(thisindy==indy)
			{
				
				if(stext==$(this).text() || $(this).text().indexOf(stext)>-1 )
					{
						//$(this).closest("tr").css({"border":"2px solid green"})
						$(this).closest("tr").show();
					}else
						{
						//	$(this).closest("tr").css({"border":"2px solid red"})
							$(this).closest("tr").hide()
						}
				
				
			}
	})
}
function app_datepickerinit(element, format)
{
//     c('x',$.fn.bootstrapDP) 
//     c('y',$.fn.datepicker) 
//     c('z',$.fn.datepicker.noConflict) 
	if (!$.fn.bootstrapDP && $.fn.datepicker && $.fn.datepicker.noConflict) 
	{
            var datepicker = $.fn.datepicker.noConflict();
            $.fn.bootstrapDP = datepicker;
//            c("I am scheckign for the datepicker")
        }
	
	
    $.each($(".datepicker"), function(i,elem){
//		c("I am scheckign for the datepicker aggain")
            if($(elem).hasClass('hasDatepicker'))
                    return;
            if($(elem).closest(".calcontainer").length)
                    return;
            $(elem).bootstrapDP({ 
                    format: format,
                    autoclose:true,
                    onSelect: function () {
                            $(this).val(this.value);
                            $(this).change();
                    }
            });
    });
}
document.addEventListener("DOMContentLoaded", function()

{
	// set_search_columns();	
	set_submenuclicktosetactive();
	set_mobilemenu_trigger();
	set_input_focus_ui(); 
		set_accordions();
		if ($('.datepicker').length > 0)
		{
//			$(".datepicker").each(function(){
//				app_datepickerinit(this)
//            });
		}
		// in the repoerts area , prevent the enter button from submitting the form
		$("#report-table").find("tr:nth-child(1)").find("input").on("keypress",function(ev){
				if(ev.which == 13) {
					ev.preventDefault();
				  }
		   
		   })
	   
		if (window.location.pathname!='/index.php')
		   $(".panel-menu").unbind()
        $(".panel-menu").click(function()
        {
			parent=$(this).parent();
			if($(parent).find(".panel-menu .panelmenucontent").is(":visible"))
				action='hide';
			else
				action='show';
			
			$(".panelmenucontent").hide();
				if(action=="hide")
					$(parent).find(".panel-menu .panelmenucontent").hide();
				else
					$(parent).find(".panel-menu .panelmenucontent").show();
			});
		})

function setdashboardmenuheight()
{
	
	if($(".dashboard-overview").closest("#modal"))
		return;
	
	setTimeout(function(){
		
		console.warn("We are increasing out dashboard heeight..... Dont d o this in a modal")
		
		dashheight=$(".dashboard-overview").height();
		menuheight=$(".dashboard-menu").height();
		if(dashheight>menuheight)
			{
				$(".dashboard-menu").css({"height":parseInt($(".dashboard-overview").height())})
			}
			else if(dashheight<menuheight)
			{
				$(".dashboard-overview").css({"height":parseInt($(".dashboard-menu").height())})
			}
		},1000)
}

function c(inn,lab)
{
	console.info(lab)
	console.log(inn)
}
function movefilters(settings,json)
{
	if($(".ph-messageboard").length && $("#messagefilters").length)
	{
		$(".ph-messageboard").append($("#messagefilters"))
		$("#messagefilters").before("&nbsp;&nbsp;")
	}
}
function gotopage(url)
{
	console.log(url)
	return window.location.href=url
}
function set_mobilemenu_trigger()
{
	$("li.bars").click(function(event){
		event.preventDefault(); 
	$("body").toggleClass("mobilemenuopen");
		
		
	 })
}
function set_accordions()
{
	if(!$("#accordioncase").length)
		return;
	$(".accordiontitle").click(function(){
		$(this).closest(".accordion-item").toggleClass('isopen');
	})
}

function set_submenuclicktosetactive()
{
	
	$("ul#tabbedlist li").click(function(){
		
		$("ul#tabbedlist li.active").removeClass("active")
		$(this).addClass("active")
		
	})
	
}

function set_input_focus_ui()
{
	return;
	$("#updatefielddiv input,select,textarea").on("focus",function(){
		$(".focusedinput").removeClass("focusedinput")
		$(".focusedrowinput").removeClass("focusedrowinput")
		$(this).closest("td").addClass('focusedinput');
		$(this).closest("tr").addClass('focusedrowinput');
	})
}
function set_focusedinputs(force)
		{
			return;
			if($('#pagecontent').hasClass('pagetype-edit') || $('#pagecontent').hasClass('pagetype-submenu') || force > 0)
			{
				//console.log("Setting the enhanced inputs")
				// if we find two inputs in a td add a class to control this
				
				$.each($("form table").find('input[type=text]'),function(){
							
					//console.log($(this).closest("td").children("div").length);
					if($(this).closest("#multipledatepicker-wrapper").length >0 )
						return;
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").find('input[type=text]').length ==2)
							$(this).closest("tr").addClass("double-input-ui");
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").children("div").length >1) 
							$(this).closest("tr").addClass("double-input-ui");
					
					$(this).addClass('focusedinput')
				})
				$.each($("form table").find('input[type=file]'),function(){
							
					//console.log($(this).closest("td").children("div").length);
					if($(this).closest("#multipledatepicker-wrapper").length >0 )
						return;
					if($(this).closest("td").children("div").length >1)
						$(this).closest("tr").addClass("file-input-ui");
				})
				$.each($("form table").find('select'),function(){
							
					if($(this).closest("#multipledatepicker-wrapper").length >0 )
						return;
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").find('input[type=text]').length ==2)
							$(this).closest("tr").addClass("double-input-ui");
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").children().length >1)
							$(this).closest("tr").addClass("double-input-ui");
				})
				$.each($("form table").find('[btn-icon-button]'),function(){
					
					if($(this).closest("#multipledatepicker-wrapper").length >0 )
						return;
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").find('input[type=text]').length ==2)
							$(this).closest("tr").addClass("double-input-ui");
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").children().length >1)
							$(this).closest("tr").addClass("double-input-ui");

					if(!$(this).hasClass('fullwidth-ui-disallow'))
						if($(this).closest("td").children().length ==1)
							$(this).closest("tr").addClass("fullwidth-ui");
				})
				$.each($("form table").find('[btn-icon-input]'),function(){
							
					if($(this).closest("#multipledatepicker-wrapper").length >0 )
						return;
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").find('input[type=text]').length ==2)
							$(this).closest("tr").addClass("double-input-ui");
					if(!$(this).hasClass('double-input-ui-disallow'))
						if($(this).closest("td").children().length >1)
							$(this).closest("tr").addClass("double-input-ui");

					if(!$(this).hasClass('fullwidth-ui-disallow'))
						if($(this).closest("td").children().length ==1)
							$(this).closest("tr").addClass("fullwidth-ui");
				})
				
				$.each($("form table").find('input[type=password]'),function(){
							
					//console.log($(this).closest("td").children("div").length);
					
					
					$(this).addClass('focusedinput')
				})
				
				
				$.each($('.focusedinput'),function(){
					
					if(!$(this).closest(".fi-hl").length)
					{
						$(this).wrap("<div class='fi-hl' style='margin:0 3px'></div>");
						$(this).closest('.fi-hl').append("<span class=highlight></span><span class=bar></span>");
					}
					
				})
				
				
				
				
				
				
				
				/*
				to be imlemented when labels are ready
				console.log('I am in doc ready and being called')
	
				$.each($('input[type=text]'),function(){

					if(!$(this).closest('form').hasClass('enhanced-user-interface'))
						$(this).closest('form').addClass('enhanced-user-interface')

					$(this).addClass('focusedinput2')
					$(this).attr('id',$(this).attr('name'))
					$(this).wrap('<label for='+$(this).attr('name')+' ></label>')
				});
				*/
				
				
			}
			
			
		}
		
		
$(document).ready(function(){
	setTimeout(function(){
	//	set_focusedinputs()
	},100)
	
})

function add_searchablecolumns_table(skiparray)
{
	var dt=$("table.dataTable");
}

function make_data_tables(tableid,forcepagesearch,callbackfunc)
{
    
	var lengthdefinition='"lengthMenu": [[100,  500, -1], [100,   500, "All"]]';
	usespecialcolumnsort=1;
	if($("#"+tableid).find('tr').length<3)
	{
		usespecialcolumnsort=0
	}
	pagingdefinition='';
	numrows=$("#"+tableid).find('tr').length;
	
	if (numrows< 15 )
	{
		pagingdefinition='"paging":   false,';
		infodefinition='"info":     false,';
		searchingdefinition='"searching":     false,';
		autowidthdefinition='"autoWidth": false,';
	}
	else
	{
		pagingdefinition='"paging":   true,';
		infodefinition='"info":     true,';
		searchingdefinition='"searching":     true,';
		autowidthdefinition='"autoWidth": false,';
	}
	if(typeof forcepagesearch !='undefined')
	{
		if(forcepagesearch==1)
			searchingdefinition='"searching":     true,';
	}
	// we shoudl destroy any instance of the dataTable that may aqlready be initiallized
	destroyerdefinition="destroy: true,";

	/* Create an array with the values of all the input boxes in a column */
	$.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
	{
		return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			return $('input', td).val();
		} );
	}

	/* Create an array with the values of all the input boxes in a column, parsed as numbers */
	$.fn.dataTable.ext.order['dom-text-numeric'] = function  ( settings, col )
	{
		return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			return $('input', td).val() * 1;
		} );
	}

	/* Create an array with the values of all the select options in a column */
	$.fn.dataTable.ext.order['dom-select'] = function  ( settings, col )
	{
		return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			return $('select', td).val();
		} );
	}

	/* Create an array with the values of all the checkboxes in a column */
	$.fn.dataTable.ext.order['dom-checkbox'] = function  ( settings, col )
	{
		return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			return $('input', td).prop('checked') ? '1' : '0';
		} );
	}
 
	if(usespecialcolumnsort)
	{ // we need to see what type of content we are working with and set up sorting
		colarray=[];
		if($("#"+tableid).find('tr:nth-child(2)').find('td').length)
			$.each($("#"+tableid).find('tr:nth-child(2)').find('td'),function(ind,ob){
				if($(ob).find('input[type="text"]').length)
					colarray[ind]="dom-text";
				else if($(ob).find('input[type="text"]').length && $(ob).find('input[type="text"]').hasClass('sort-numeric'))
					colarray[ind]="dom-text-numeric";
				else if($(ob).find('input[type="checkbox"]').length)
					colarray[ind]="dom-checkbox";
				else if($(ob).find('select').length)
					colarray[ind]="dom-select";
				else // if(!$(ob).find('select').length && !$(ob).find('input[type="text"]').length && !$(ob).find('input[type="checkbox"]').length)
					colarray[ind]="null";
			});
		sort_definitions='"columns": [';
		$.each(colarray,function(indexer,objector){

			if(objector=="dom-text")
				sort_definitions+='{"orderDataType": "'+objector+'", type:"string" },\n';
			else if(objector=='dom-checkbox')
				sort_definitions+='{"orderDataType": "'+objector+'"},\n';
			else if(objector=='dom-select')
				sort_definitions+='{"orderDataType": "'+objector+'"},\n';
			else
				sort_definitions+='null,\n';
		});
		sort_definitions=sort_definitions.substring(0, sort_definitions.length - 1);
		sort_definitions+='\n]';
	}
	else
	{
		console.log('nospecilcolumnsort');
		sort_definitions="";
	}
	callbackdef="";
	if(callbackfunc)
	{
		callbackdef='initComplete: function(settings, json) {'+callbackfunc+'(settings,json)},';
	}
	console.log('columnsort',sort_definitions );
	var functioncall='var tableData= $("#'+tableid+'").DataTable({"order": [],'+pagingdefinition+autowidthdefinition+infodefinition+searchingdefinition+callbackdef+destroyerdefinition+'"columnDefs": [ {"targets"  : "no-sort","orderable": false,}],'+sort_definitions+","+lengthdefinition+'});';
	setTimeout(functioncall,0);

	setTimeout(function()
	{
		tableData.on('page', function ()
		{
			var info = tableData.page.info();
			if(info.page===0)
			{
				setTimeout(function(){
					$("#"+tableid+"_previous").css({"opacity":"0","transition":"all 1s"}) ;
				},50);
			}
			if(info.page>0)
			{
				setTimeout(function(){
					$("#"+tableid+"_previous").css({"opacity":"1","transition":"all 1s"}) ;
				},50)
			}
			if(info.page+1==info.pages)
			{
				setTimeout(function(){
					$("#"+tableid+"_next").css({"opacity":"0","transition":"all 1s"}) ;
				},50)
			}
			if(info.page+1<info.pages)
			{
				setTimeout(function(){
					$("#"+tableid+"_next").css({"opacity":"1","transition":"all 1s"}) ;
				},50)
			}
		} );
		
   },0) ;
	if(callbackfunc)
		setTimeout(callbackfunc,0);
}

function catch_form_submit(containerselector)
{
	console.log("Binding the form submittal",containerselector)
	$(containerselector+":visible").find('form').on("submit",function(e) {

		//alert("Form Submitting")
		e.preventDefault(); // cancel the actual submit
//		console.log("using container_submit on form: ",$(this))
//		console.log("using container_submit on form: ",$(containerselector+":visible").attr("id"))
		container_submit($(containerselector+":visible form"),containerselector,$(document.activeElement).attr('name'));
		return false;
	});
}
// container- modal updated
var container_breadcrumbs = [];
function container_reload(currurl, containerselector)
{
	var notdone = true;
	var title = '';
	while (container_breadcrumbs.length > 0 && notdone)
	{
		var urlobj = container_breadcrumbs.pop();
		$.each(urlobj, function(name, url) 
		{
			if (url == currurl)
			{
				title = name;
				notdone = false;
			}
		});
	}
	container_load(currurl, true, containerselector,title);
}
function container_refresh(containerselector)
{
	container = $(containerselector);
	if(!container.attr('href'))
		alert("Invalid attempt to container_refresh("+containerselector+")")

	container_load(container.attr('href'), false, containerselector);
}
function container_load(url, urlreturn, containerselector, title)
{
    container_open(title, "",containerselector);
    if(!$(containerselector).find('.container-loadingicon').length)
        $(containerselector).prepend("<div class='container-loadingicon'><img src='/images/ajax_loading.gif'/></div>");
    container = $(containerselector);
    var contentarea = container;
    var containertitle = false;
    var containerbreadcrumbs = false;
    var containerbodyname = container.data('bodyclass');
    if(containerbodyname)
        contentarea = $("."+containerbodyname);
    var containertitlename = container.data('titleclass');
    if(containertitlename)
        containertitle = $("."+containertitlename);
    var containerbreadcrumbsname = container.data('breadcrumbsclass');
    if(containerbreadcrumbsname)
        containerbreadcrumbs = $("."+containerbreadcrumbsname);
    if(url.indexOf("?")<1)
        url +='?'
    else
        url +='&'
    if( $(containerselector).attr('id') && $(containerselector).attr('id').indexOf('modal') !== -1 )
        url += 'in_modal=1';
    url += '&container=1';
    console.log('url', url);
    contentarea.load(url,function()
    {
            var loadingtitle = title;
            container_processcontent(containerselector);
            var head2 = $(container).find('.head2');
            if (head2.length > 0)
            {
                    head2 = head2[0];
                    loadingtitle = $(head2).text();
                    if(containertitle.length>0)
                            $(head2).remove();
            }
            if(!loadingtitle)
                    var loadingtitle = '&nbsp;';
            if(containertitle)
            {
                containertitle.html(loadingtitle);
            }

            if (urlreturn)
            {
                    var urlobj = {};
                    urlobj[loadingtitle] = url;

                    var notdupe = true;
                    $.each(container_breadcrumbs, function(i, e) 
                    {
                            $.each(e, function(name, bc_url) 
                            {
                                    if (bc_url == url)
                                    {
                                            notdupe = false;
                                    }
                            })
                    });
                    if (notdupe)
                            container_breadcrumbs.push(urlobj);
            }

            var text_breadcrumbs = sep = "";
            text_breadcrumbs+="<div class='breadcrumb-case'><ul class='breadcrumb'>";
            $.each(container_breadcrumbs, function(i, e) 
            {
                    $.each(e, function(name, bc_url) 
                    {
                            if (bc_url == url)
                                    notdupe = false;
                            text_breadcrumbs += sep+"<li class=''><a onclick=\"container_reload('"+bc_url+"','"+containerselector+"','"+loadingtitle+"')\" style='cursor:pointer;'>"+name+"</a></li>";
                            sep = " > ";
                    })
            });
            text_breadcrumbs+="</ul></div>";
            if(containerbreadcrumbs)
                    containerbreadcrumbs.html(text_breadcrumbs);
            $(".container-loadingicon").remove();
    });
}

var container_page_needsreload = false;
function container_pageneedsreload(needsreload, containerselector)
{
	var rval = container_page_needsreload;
	if (needsreload)
		container_page_needsreload = needsreload;
	return rval;
}
var container_submit_name = '';
var container_submit_value = '';
function container_isinside(obj)
{
	var container =  $(obj).closest('[container_selector_name]'); 
	if(container.length>0)
		return container; 
	return false
	

}
function container_closest(obj)
{
	console.log(obj,'obj')
	var container =  $(obj).closest('[container_selector_name]'); 
	if(container.length>0)
		return container; 
	return false
	

}
function container_processcontent(containerselector)
{
    $(containerselector).attr('container_selector_name',containerselector)
    console.log('container_processcontent1', containerselector);
    $(containerselector).find('form').each(function()
    {
        var frm = $(this);
        frm.submit(function(){
            if( $(frm).data('presubmitfunction') )
            {
                eval("var retval = "+$(frm).data('presubmitfunction')+"($(containerselector).find('form'));");
                if(retval === false)
                    return false;
            }
            container_submit(this, containerselector,container_submit_name);
            return false;
        })
    })
    $(containerselector).find('a').each(function()
    { 
        var href = $.trim($(this).attr('href'))
        if(href.slice(0,2)=='//' || href.slice(0,4)=='http')
        	return;
        if($(this).hasClass('container-tabcontent'))
            return;
    	$(this).unbind('click')
    	$(this).click(function(e)
    	{
            var href = $(this).attr('href')
            if(typeof(href)=='undefined')
                 return;
            if(href.indexOf('javascript') > -1)
                 return;
            if($(this).hasClass('container-tabcontent') && containerselector.indexOf('tab_content')==-1)
            {
                var type = '';
                var startindex = href.indexOf('type=')+5;
                var endindex = href.indexOf('&',startindex);
                if(endindex != -1)
                    type = href.substring(startindex, endindex);
                else
                    type = href.substring(startindex);
                if(type)
                    containerselector = containerselector+" ."+type+"tab_content";
            }
            container_load(href,'',containerselector)
            e.preventDefault();
            return false;
    	})
     })
    $(containerselector).find('input[type=submit]').click(function(){
        container_submit_name = $(this).attr('name');
        container_submit_value = $(this).val();
    }) 
	$(containerselector).attr('container_processcontent','true')
}
function container_submit(frm, containerselector,submitname)
{ 
    containerclosepagereload = 1; //Used in modal_close().
    if(!containerselector)
        containerselector=container_closest(frm);

    if(!frm)
        frm = $(containerselector).find('form');
    if($(frm)[0].nodeName!='FORM')
        frm = $(frm).closest('form');
    if(container_submit_name)
    {
        if($('[name='+container_submit_name+']').hasClass('nocontainersubmit'))
            $(frm).unbind('submit').submit();
    }
    
    var furl = $(frm).attr('action');    
    var fdata = $(frm).serialize();

    if(!submitname)
    	submitname = 'submit';
    
    fdata += "&container=1&submit="+submitname;
    if(container_submit_name)
        fdata += "&"+container_submit_name+"="+container_submit_value;
    var container = $(containerselector);
    if($(container).attr('container_selector_name').length > 0)
    {
        fdata += "&container_selector_name="+$(container).attr('container_selector_name');        
    }
    var containertitlename = container.data('titleclass');
    var title = '';
    if(containertitlename)
        title = $("."+containertitlename).html();
	console.log("furl", furl);
    $.ajax({
        url:furl
        , data: fdata
        , method: 'POST'
        , success: function (message) {
        	container_open(title, message,containerselector)
			
        }
    })  
}
function container_open(title, content, containerselector)
{
    var container = $(containerselector);
    var contentarea = container;
    var containerbodyname = container.data('bodyclass');
    if(containerbodyname)
            contentarea = $("."+containerbodyname);
    var containertitlename = container.data('titleclass');
    if(containertitlename)
    {
            $("."+containertitlename).html(title);
            console.log('title: '+title);
    }
    if(container.data('openclass'))
            $("body").addClass(container.data('openclass'));

    contentarea.html(content);
    container_processcontent(containerselector)
	setTimeout(function(){
				set_focusedinputs()
			},0)
}
function container_close(containerselector)
{
    if (container_breadcrumbs.length > 1)
    {
            container_breadcrumbs.pop();
            var urlobj = container_breadcrumbs.pop();
            var lasturl;
            $.each(urlobj, function(name, url) 
            {
                    lasturl = url;
            });
            container_load(lasturl,1,containerselector);
    }
    else
    {
    	container_breadcrumbs = [];
    	var container = $(containerselector);
    	if(container.data('openclass'))
    		$("body").removeClass(container.data('openclass'));
    	
    	var containertitlename = container.data('titleclass');
    	if(containertitlename)
            $("."+containertitlename).html();

        try //Add modal_close_page_reload(){return 1;} to any page that wants to be reloaded on modal_close(), including after a modal_submit().
        { 
                if(container_pageneedsreload() || modal_close_page_reload())
                        location.reload();
                else if(container_close_page_reload() || containerclosepagereload)
                        location.reload();
        }
        catch(e)
        {
        }
    }
}
var modaltitle = '';
function modal_load(title, url, urlreturn)
{ 
	modaltitle = title;
        
	container_load(url, urlreturn, '#modal',modaltitle)
}
function modal_processcontent(modal)
{
	container_processcontent(modal)
}
function modal_submit(frm)
{ 
	container_submit(frm, '#modal')
}
function modal_open(title, content)
{
	modaltitle= title;
	container_open(modaltitle, content, '#modal')
}
function modal_close()
{
	container_close('#modal')
}
function help_modal_open(helpshortname,editmode,addtourl)
{    
    if(!editmode)
        editmode=0;
    
    var url = '_help_content.php?helpshortname=' + helpshortname + '&editmode=' + editmode;
    if(addtourl)
        url = url + '&' + addtourl;
    container_load(url, '', '#modal','Help');

}
function window_seturl(url)
{
    window.history.pushState({},'',url);
}
function currency_format(val)
{
    var formatdata = {currency: currentcountry.countrycurrencyisocode, locale: currentcountry.countrylocale}
    return OSREC.CurrencyFormatter.format(val, formatdata);

}
function currency_parse(val)
{
    var formatdata = {currency: currentcountry.countrycurrencyisocode, locale: currentcountry.countrylocale}
    return OSREC.CurrencyFormatter.parse(val, formatdata);
}
function currency_symbolget()
{
    var currencysymbol = OSREC.CurrencyFormatter.symbols[currentcountry.countrycurrencyisocode];
    return currencysymbol;
}
function currency_formatget()
{
    var currencyformat = OSREC.CurrencyFormatter.locales[currentcountry.countrylocale].p;
    if(!currencyformat)
    {
        var parentlocale = currentcountry.countrylocale.split('_')[0];
        var currencyformat = OSREC.CurrencyFormatter.locales[parentlocale].p;
    }
    return currencyformat;
}

function form_ajaxsubmit(frm,callback,submitname)
{
     
    
    var furl = $(frm).attr('action');     
    var fdata = $(frm).serialize();

    if(!submitname)
    	submitname = 'submit';
    
    fdata += "&form_ajaxsubmit=1";
     
    console.log('furl', furl);
    $.ajax({
        url:furl
        , data: fdata
        , method: 'POST'
        , success: function (message) {
        	callback(message)
			
        }
    })  
}
function modal_reload_onclose()
{
    $('#modal:visible').attr('reloadonclose','true') 
}
function waiticon(selector)
{
    if(!$(selector).find('.waitwall').length)
        $(selector).prepend("<div class='waitwall'><img src='/images/ajax_loading.gif'/></div>");
}
function waiticonremove()
{
    $(".waitwall").remove();
}



function allowDrop(ev) 
{
    console.log('allowDrop Fires!');    
    ev.preventDefault();
}

function drag(ev) 
{
    console.log('Drag Fires!');
    ev.dataTransfer.setData("objectid", $(ev.target).data('objectid'));
}

function drop(ev, type)
{
    console.log('drop Fires!');
    ev.preventDefault();
    var objectid = ev.dataTransfer.getData("objectid");
    movingtr = $('tr[data-objectid="'+objectid+'"]');
    tbl = $(movingtr).closest('tbody');
    console.log('tbllength', $(tbl).length);
    landingtr = $(ev.target);
    if( !$(ev.target).is('tr') )
        landingtr = $(ev.target).closest('tr');

    console.log('landingtr.index', $(landingtr).index() );
    console.log('movingtr.index', $(movingtr).index() );
    updaterank = $(landingtr).index() - $(movingtr).index();
    $.get('object.php?rankid='+objectid+'&edit='+objectid+'&type='+type+'&updaterank='+updaterank, function(){
        if(updaterank < 0)
            $(landingtr).before(movingtr);
        else
            $(landingtr).after(movingtr);            
    })
}

function dt_format(date)
{
    year = date.getFullYear();
    month = date.getMonth()+1;
    day = date.getDate();
    return month+'/'+day+'/'+year;
}

