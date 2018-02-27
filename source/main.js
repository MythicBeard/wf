var loading = true;
if ('speechSynthesis' in window) {} else
	alert('Your antiquated web browser does not support speech synthesis.  Upgrade, or use something decent, to enable voice tracking.');

for (var i = 0; i < localStorage.length; i++){
	console.log(localStorage.key(i)+' = '+localStorage.getItem(localStorage.key(i)));
}
//localStorage.clear();
/* ----- Auto refresh ----- */
var refresh = {
	'rate': 30,
	'on': true,
	'last': 0,
};

refresh.get_saved = function () {
	var saved = localStorage.getItem('refresh.on');
	if (saved == null)
		localStorage.setItem('refresh.on', refresh.on);
	else if (saved == 'true')
		refresh.on = true;
	else if (saved == 'false')
		refresh.on = false;
	saved = localStorage.getItem('refresh.rate');
	if (saved != null)
		refresh.rate = saved;
	else
		localStorage.setItem('refresh.rate', refresh.rate);
};
refresh.get_saved();

refresh.start = function () {
	var rate = refresh.rate*1000;
	clearInterval(refresh.interval);
	refresh.interval = setInterval(function(){get_data();}, rate);
	$('#header #refresh').css('color', 'rgb(0,155,0)');
	localStorage.setItem('refresh.on', 'true');
};

refresh.stop = function () {
	clearInterval(refresh.interval);
	$('#header #refresh').css('color', 'rgb(155,0,0)');
	localStorage.setItem('refresh.on', 'false');
};

refresh.toggle = function () {
	if (refresh.on) {
		refresh.on = false;
		refresh.stop();
	}
	else {
		get_data();
		refresh.on = true;
		refresh.start();
	}
	//var audio = new Audio('source/click1.mp3');
	//audio.play();
};

setTimeout(function(){
	$('#rrate').val(refresh.rate);
	if (refresh.on === false)
		$('#header #refresh').css('color', 'rgb(155,0,0)');
	else
		refresh.start();
	
	$('#rrate').on('input',function(e){
		refresh.rate = $('#rrate').val();
		if (refresh.rate == '')
			refresh.rate = 30;
		if (refresh.rate < 5)
			refresh.rate = 5;
		if (refresh.on !== false)
			refresh.start();
		localStorage.setItem('refresh.rate', refresh.rate);
	});
}, 300);

refresh.flash = function () {
	$('#logo img').animate({opacity: 0.25}, 400, 'linear');
	setTimeout(function () {$('#logo img').animate({opacity: 1}, 400);}, 600, 'linear');
};


/* ----- Speech ----- */
var speech = {
	'on': true,
	'queue': {},
	'volume': 100,
};

speech.get_saved = function () {
	var saved = localStorage.getItem('speech.on');
	if (saved == null)
		localStorage.setItem('speech.on', speech.on);
	else if (saved == 'true')
		speech.on = true;
	else if (saved == 'false')
		speech.on = false;
	saved = localStorage.getItem('msg.volume');
	if (saved != null)
		speech.volume = saved;
};
speech.get_saved();

setTimeout(function () {
	if (speech.on === false)
		$('#header #sound').css('color', 'rgb(155,0,0)');
	
	$('#volume').on('input',function(e){
		var vol = Math.ceil($('#volume').val());
		localStorage.setItem('msg.volume', vol);
	});
	$('#volume').val(speech.volume);
	
}, 10);

speech.voices = window.speechSynthesis.getVoices();
	
speech.say = function (phrase) {
	if (!speech.on || !'speechSynthesis' in window)
		return;
	var synth = window.speechSynthesis;
	speech.voices = window.speechSynthesis.getVoices();
	var voice = setInterval(function() {
		if (!speech.voices || speech.voices.length == 0)
			return;
		var msg = new SpeechSynthesisUtterance(phrase);
		msg.voice = speech.voices[4];
		msg.pitch = 1.1;
		msg.rate = 1;
		var vol = $('#volume').val();
		if (vol !== '')
			vol = ($('#volume').val())/100;
		else {
			$('#volume').val(1);
			vol = .01;
		}
		if (vol > 1)
			vol = 1;
		else if (vol < 0.01)
			vol = .01;
		localStorage.setItem('msg.volume', Math.ceil(vol*100));
		msg.volume = vol;
		msg.onstart = function () {
			$('#header #logo img').css('filter', 'drop-shadow(0px 0px 3px goldenrod)');
		};
		msg.onend = function () {
			$('#header #logo img').css('filter', 'none');
		};
		synth.speak(msg);
		clearInterval(voice)
	}, 200);	
};

speech.next = function () {
	var phrase;
	for (let key in speech.queue) {
		phrase = key;
		break;
	}
	if (speech.on)
		speech.say(phrase);
	delete speech.queue[phrase];	
	var total = Object.keys(speech.queue).length;
	if (total !== 0)
		return;
	clearInterval(speech.interval);
	delete speech.interval;
};

speech.addqueue = function (phrase) {
	if (!speech.on || !'speechSynthesis' in window)
		return;
	var total = Object.keys(speech.queue).length;
	if (total == 0)
		speech.queue['tenno!'] = true;
	if (!speech.queue[phrase])
		speech.queue[phrase] = true;
	if (speech.interval) 
		return;
	speech.interval = setInterval(speech.next, 1000);
};

speech.togglemute = function () {
	speech.on = !speech.on;
	localStorage.setItem('speech.on', speech.on);
	if (speech.on) {
		$('#header #sound').css('color', 'rgb(0,155,0)');
	}
	else {
		window.speechSynthesis.cancel();
		speech.queue = {};
		$('#header #sound').css('color', 'rgb(155,0,0)');
	}
	//var audio = new Audio('source/click1.mp3');
	//audio.play();
};


/* ------ Tracking ----- */
var track = {
	'old': {
		'alerts': {},
		'cetusCycle': 0,
		'fissures': {},
		'invasions': {},
	},
	'tracking': {
		'alerts': true,
		'cetusCycle': true,
		'fissures': false,
		//'invasions': false,
	},
	'bad': [],
};


track.get_saved = function () {
	for (let key in track.tracking) {
		var saved = localStorage.getItem('track.tracking.'+key);
		if (saved == null)
			localStorage.setItem('track.tracking.'+key, track.tracking[key]);
		else if (saved == 'true')
			track.tracking[key] = true;
		else if (saved == 'false')
			track.tracking[key] = false;
	}
};
track.get_saved();

setTimeout(function () {
	for (let key in track.tracking) {
		if (track.tracking[key] === true)
			$('#'+key+' .sound_icon').css('color', 'rgb(0,155,0)');
	}
}, 10);

var cetus_alarm = {
	15:true,
	10:true,
	5:true,
	3:true,
	1:true,
};
track.cetusCycle = function (time, left) {
	if (left.match('h'))
		return;
	var min = Number(left.replace('m', ''));
	if (min === track.old.cetusCycle)
		return;
	var stop = true;
	if (cetus_alarm[min])
		stop = false;
	track.old.cetusCycle = min;
	var next;
	if (time === 'Day')
		next = 'night';
	else
		next = 'day';
	if (loading !== true && stop !== true && track.tracking.cetusCycle)
		speech.addqueue('Cetus '+next+'time is in, '+min+' minutes');
};

track.alerts = function (alerts) {
	if (alerts.length <= 0)
		return;
	for (let i=0; i<alerts.length; i++) {
		var at = alerts[i];
		if (track.old.alerts[at.id])
			continue;
		if (at.expired) {
			delete track.old.alerts[at.id];
			continue;
		}
		var d = new Date();
		var t = d.getTime();
		track.old.alerts[at.id] = t;
		if (at.mission.reward.itemString == '')
			at.mission.reward.itemString = at.mission.reward.credits+' Credits';
		if (loading !== true && track.tracking.alerts)
			speech.addqueue('Mission alert for, '+at.mission.reward.itemString);
	}
	for (let key in track.old.alerts) {
		var d = new Date();
		var t = d.getTime();
		var diff = t-Number(track.old.alerts[key]);
		if (diff > 7200000)
			delete track.old.alerts[key];
	}
};

track.fissures = function (fissures) {
	for (let i=0; i<fissures.length; i++) {
		var fs = fissures[i];
		if (track.old.fissures[fs.id])
			continue;
		if (fs.expired) {
			delete track.old.fissures[fs.id];
			continue;
		}
		var d = new Date();
		var t = d.getTime();
		track.old.fissures[fs.id] = t;
		if (loading !== true && track.tracking.fissures === true)
			speech.addqueue('Void fissure open, T'+fs.tierNum+' '+fs.missionType);
	}
	for (let key in track.old.fissures) {
		var d = new Date();
		var t = d.getTime();
		var diff = t-Number(track.old.fissures[key]);
		if (diff > 7200000)
			delete track.old.fissures[key];
	}
};

// toggle sound option
var toggleoption = function (opt) {
	track.tracking[opt] = !track.tracking[opt];
	if (track.tracking[opt] === true)
		$('#'+opt+' .sound_icon').css('color', 'rgb(0,155,0)');
	else
		$('#'+opt+' .sound_icon').css('color', 'rgb(155,0,0)');
	localStorage.setItem('track.tracking.'+opt, track.tracking[opt]);
};


/* ----- Collapse / Expand ----- */
var collapsed_saved = function () {
	$('.info_box').each(function( index ) {
		var id = $(this).attr('id');
		var saved = localStorage.getItem('div.'+id);
		if (saved == null)
			return true;
		else
			$('#'+id).css('height', saved);
	});
};
setTimeout(function(){collapsed_saved();}, 20);


var collapse_all = function () {
	$('.info_box').each(function( index ) {
		var id = $(this).attr('id');
		if (id == 'conclave')
			return true;
		$('#'+id).stop().animate({'height': '40px'}, 200);
		$('#'+id+' .collapse_tab').css('color', 'rgb(225,0,0)');
		localStorage.setItem('div.'+id, '40px');
	});
	//var audio = new Audio('source/click1.mp3');
	//audio.play();
};
var expand_all = function () {
	$('.info_box').each(function( index ) {
		var id = $(this).attr('id');
		$('#'+id).animate({
			height: $('#'+id).get(0).scrollHeight
		}, 200, function(){
			$(this).height('auto');
		});
		$('#'+id+' .collapse_tab').css('color', 'rgb(0,155,0)');
		localStorage.setItem('div.'+id, 'auto');
	});
	//var audio = new Audio('source/click1.mp3');
	//audio.play();
};

var collapse_tab = function (tab) {
	var ht = $('#'+tab).css('height');
	if (ht === '40px') {
		$('#'+tab).animate({
			height: $('#'+tab).get(0).scrollHeight
		}, 200, function(){
			$(this).height('auto');
		});
		$('#'+tab+' .collapse_tab').css('color', 'rgb(0,155,0)');
		localStorage.setItem('div.'+tab, 'auto');
	}
	else {
		$('#'+tab).stop().animate({'height': '40px'}, 200);
		$('#'+tab+' .collapse_tab').css('color', 'rgb(225,0,0)');
		localStorage.setItem('div.'+tab, '40px');
	}
	//var audio = new Audio('source/click1.mp3');
	//audio.play();
};



/* ----- Top / Bottom ----- */
function to_top() {	$('body').stop().animate({scrollTop: '0px'}, 250); }
function to_bottom() { $('body').stop().animate({scrollTop: $(document).height()}, 250); }
$(window).scroll(function(){
	//$("#header").stop(true,false);
	$("#header").css('top', ($(window).scrollTop()+0) + "px");
	$("#collapse_all").css('top', ($(window).scrollTop()+300) + "px");
	$("#expand_all").css('top', ($(window).scrollTop()+340) + "px");
  	$("#to_top").css('top', ($(window).scrollTop()+300) + "px");
	$("#to_bottom").css('top', ($(window).scrollTop()+340) + "px");
	$('#help').css('top', ($(window).scrollTop()+6) + "px");
	$('#wf').css('top', ($(window).scrollTop()+6) + "px");
	if ($(window).scrollTop() <= 10) {
		$('#help').css('top', ($(window).scrollTop()+24) + "px");
		$('#wf').css('top', ($(window).scrollTop()+24) + "px");
	}
});



/* ---- Load Everything ----- */
var get_data = function () {
$('#header #refresh').css('opacity', '0.3');
//refresh.flash();
var wf = {};
$.getJSON('https://ws.warframestat.us/pc', function (data) {
	wf = data;

	/* ----- Sorties ----- */
	var sortie = {
		'hr': wf.sortie.eta.match(new RegExp("\\d+h")),
	};
	if (wf.sortie.eta.match(new RegExp("\\d+m")))
		sortie.mn = wf.sortie.eta.match(new RegExp("\\d+m"));
	else
		sortie.mn = '0m';
	sortie.hr = Number(sortie.hr[0].replace('h', ''));
	sortie.mn = sortie.mn[0].replace('m', '');
	$('#sorties #left').html(sortie.hr+'h '+sortie.mn+'m');
	
	
	/* ----- Rep ----- */
	if ((sortie.hr+7) >= 24) {
		var hr = (sortie.hr+7)-24;
		
		$('#rep #left').html(hr+'h '+sortie.mn+'m');
	}
	else
		$('#rep #left').html((sortie.hr+7)+'h '+sortie.mn+'m');


	/* ----- Cetus Cycle ----- */
	var cetusc = {
		'Day': 'rgb(255,255,0)',
		'Night': 'rgb(0,125,255)'
	};
	if (wf.cetusCycle.isDay)
		cetusc.time = 'Day';
	else 
		cetusc.time = 'Night';
	$('#cetusCycle #time').html(cetusc.time);
	$('#cetusCycle #sundial').html('<img src="source/time-'+cetusc.time+'.png">');
	var cetusLeft = wf.cetusCycle.timeLeft.replace(new RegExp(" \\d+s","g"), '');
	if (cetusLeft == '')
		cetusLeft = '< 1m';
	$('#cetusCycle #left').html(cetusLeft);
	
	setTimeout(function(){ track.cetusCycle(cetusc.time, cetusLeft); }, 300);


	/* ----- Daily Deal (Darvo) ----- */
	let darvos = wf.dailyDeals;
	$('#dailyDeals #info tr').remove();
	for (let i=0; i<darvos.length; i++) {
		let deal = {};
		deal.item = '<td class="dv_item">'+darvos[i].item+'</td>';
		deal.price = '<td class="dv_price"><span style="text-decoration: line-through; color: darkgrey;">'+darvos[i].originalPrice+'</span> '+darvos[i].salePrice+' (-'+darvos[i].discount+'%)</td>';
		deal.sold = '<td class="dv_sold">'+darvos[i].sold+'/'+darvos[i].total+'</td>';
		deal.time = '<td class="dv_time">'+darvos[i].eta.replace(new RegExp("\\d+s","g"), '')+'</td>';
		$('#dailyDeals #info').append('<tr>'+deal.item+deal.price+deal.sold+deal.time+'</tr>');
	}


	/* ----- Void Trader (Baro) ----- */
	var vt = {};
	if (wf.voidTrader.active) {
		vt.active = ''; 
		vt.left = wf.voidTrader.endString.replace(new RegExp("\\d+s","g"), '');
		$('#voidTrader #open').html(' &nbsp;(view inventory)');
	}
	else {
		vt.active = 'Arriving in';
		vt.left = wf.voidTrader.startString.replace(new RegExp("\\d+s","g"), '');
	}
	$('#voidTrader #active').html(vt.active);
	$('#voidTrader #left').html(vt.left);
	$('#preview #info tr').remove();
	if (wf.voidTrader.inventory.length > 0)
	for (let i=0; i<wf.voidTrader.inventory.length; i++) {
		var item = wf.voidTrader.inventory[i];
		item.credits = item.credits.toString().replace(new RegExp("000$","g"), 'k');
		item.credits = wf.voidTrader.inventory[i].credits.replace('000', ',000');
		var html = '<td class="vt_item">'+item.item+'</td>'
			+ '<td class="vt_ducats">'+item.ducats+'<img src="source/ducat.png"></td>'
			+ '<td class="vt_credits">'+item.credits+'<img src="source/credits.png"></td>'
		;
		
		$('#preview #info').append('<tr>'+html+'</tr>');
		if (i < wf.voidTrader.inventory.length-1)
			$('#preview #info').append('<tr class="al_spacer"><td colspan="3"></td></tr>');
	}
	


	/* ----- Events ----- */
	$('#events #info tr').remove();
	
	for (let i=0; i<wf.events.length; i++) {
		var evt = {};
		evt.name = wf.events[i].description;
		var html = '<td class="evt_name">'+evt.name+'</td>';
		
		if (wf.events[i].rewards.length > 0) {
			evt.reward = wf.events[i].rewards[0].asString;
			evt.thumb = wf.events[i].rewards[0].thumbnail;
			html += '<td class="evt_reward"><img src="'+evt.thumb+'" onerror="this.style.display=\'none\'" alt="">'+evt.reward+'</td>';
		}
		evt.eta = Math.floor(wf.events[i].health);
		html += '<td class="evt_eta">'+evt.eta+'% HP</td>';
		;
		evt.background = 'linear-gradient(to right, rgba(0, 105, 0, 1),	rgba(0, 105, 0, 1) '+evt.eta+'%, black, black, rgba(105, 0, 0, 1) '+evt.eta+'%, rgba(105, 0, 0, 1))';
		$('#events #info').append('<tr style="background: '+evt.background+'">'+html+'</tr>');
	}
	

	/* ----- Alerts ----- */
	$('#alerts #info tr').remove();
	for (let i=0; i<wf.alerts.length; i++) {
		if (wf.alerts[i].expired === true)
			continue;
		var alr = {};
		alr.icon_class = 'thumb effectScale';
		alr.icon = '<td class="al_icon"><img class="'+alr.icon_class+'" src="'+wf.alerts[i].mission.reward.thumbnail+'" alt=""></td>';
		alr.reward = '<td class="al_reward">'+wf.alerts[i].mission.reward.asString.replace(new RegExp("\\+ \\d+cr","g"), '').replace('Blueprint', 'BP')+
			'</br>'+wf.alerts[i].eta.replace(new RegExp("\\d+s","g"), '')+'</td>';
		alr.mission = '<td class="al_mission">'+wf.alerts[i].mission.type+'</br>'+wf.alerts[i].mission.minEnemyLevel+'-'+wf.alerts[i].mission.maxEnemyLevel+'</td>';
		$('#alerts #info').append('<tr>'+alr.icon+alr.reward+alr.mission+'</tr>');
		if (i < wf.alerts.length-1)
			$('#alerts #info').append('<tr class="al_spacer"><td colspan="3"></td></tr>');
	}
	setTimeout(function() {track.alerts(wf.alerts);}, 200);


	/* ----- Fissures ----- */
	$('#fissures #info tr').remove();
	var fisses = {
		'Lith': [],
		'Meso': [],
		'Neo': [],
		'Axi': [],
	};
	for (let i=0; i<wf.fissures.length; i++) {
		var fiss = wf.fissures[i];
		fisses[fiss.tier].push({
			'tier': fiss.tierNum,
			'type': fiss.missionType,
			'eta': fiss.eta.replace(new RegExp("\\d+s","g"), ''),
			'node': fiss.node.replace(' (', ', ').replace(')', ''),
		})
	}
	var show_fiss = function (fiss) {
		let html = '<td class="fs_tier">T'+fiss.tier+'</td>'
			+ '<td class="fs_type">'+fiss.type+'</td>'
			+ '<td class="fs_eta">'+fiss.eta+'</td>'
			+ '<td class="fs_node">'+fiss.node+'</td>'
		;
		$('#fissures #info').append('<tr>'+html+'</tr>');
	};
	for (let i=0; i<fisses.Lith.length; i++) show_fiss(fisses.Lith[i]);
	$('#fissures #info').append('<tr class="fs_spacer"><td colspan="4"</tr>');
	for (let i=0; i<fisses.Meso.length; i++) show_fiss(fisses.Meso[i]);
	$('#fissures #info').append('<tr class="fs_spacer"><td colspan="4"</tr>');
	for (let i=0; i<fisses.Neo.length; i++) show_fiss(fisses.Neo[i]);
	$('#fissures #info').append('<tr class="fs_spacer"><td colspan="4"</tr>');
	for (let i=0; i<fisses.Axi.length; i++) show_fiss(fisses.Axi[i]);
	setTimeout(function() {track.fissures(wf.fissures);}, 150);


	/* ----- Invasions ----- */
	$('#invasions #info tr').remove();
	for (let i=0; i<wf.invasions.length; i++) {
		var inv = {};
		inv.prog = Math.floor(wf.invasions[i].completion);
		if (wf.invasions[i].completed) continue;
		inv.node = wf.invasions[i].node.replace(' (', ', ').replace(')', ' (');
		inv.node = inv.node+''+inv.prog+'%)';
		inv.atk_reward = wf.invasions[i].attackerReward.asString.replace('Mutalist ', '').replace('Blueprint', 'BP').replace(' Coordinate', '').replace(' Injector', '').replace(' Mass', '');
		if (wf.invasions[i].attackerReward.asString == '')
			inv.a_thumb = 'source/credits.png'; 
		else 
			inv.a_thumb = wf.invasions[i].attackerReward.thumbnail;
		inv.def_reward = wf.invasions[i].defenderReward.asString.replace('Mutalist ', '').replace('Blueprint', 'BP').replace(' Coordinate', '').replace(' Injector', '').replace(' Mass', '');
		inv.reward = '<td class="inv_reward inv_'+wf.invasions[i].defendingFaction+'">'
			+ '<div class="inv_atk"><img src="'+inv.a_thumb+'" onerror="this.style.display=\'none\'" alt="" style="height: 15px;">'+inv.atk_reward+'</div>'
			+ '<div class="inv_node">'+inv.node+'</div>'
			+ '<div class="inv_def">'+inv.def_reward+'<img src="'+wf.invasions[i].defenderReward.thumbnail+'" onerror="this.style.display=\'none\'" alt=""></div>'
			+ '<div id="inv_'+wf.invasions[i].id+'" class="inv_prog"></div></td>'
		;
		$('#invasions #info').append('<tr>'+inv.reward+'</tr>');
		$('#inv_'+wf.invasions[i].id).css('width', inv.prog+'%').addClass('inv_'+wf.invasions[i].attackingFaction);
	}
	
	
	/* ----- News ----- */
	$('#news #info tr').remove();
	for (let i=wf.news.length-1; i>=0; i--) {
		var news = {
			'msg': wf.news[i].message,
			'link': wf.news[i].link,
			'eta': wf.news[i].eta.replace(new RegExp("\\d+s","g"), ''),
		};
		let html = '<td>['+news.eta+']</br><a href="'+news.link+'" target="_blank">'+news.msg+'</a></td>';
		$('#news #info').append('<tr>'+html+'</tr>');	
	}
	
	
	/* ----- Market ----- */
	$('#market #info tr').remove();
	for (let i=0; i<wf.flashSales.length; i++) {
		var sale = {
			'item': wf.flashSales[i].item,
			'price': wf.flashSales[i].premiumOverride+' (-'+wf.flashSales[i].discount+'%)',
			'discount': wf.flashSales[i].discount,
			'eta': wf.flashSales[i].eta.replace(new RegExp("\\d+s","g"), ''),
		};
		sale.price = sale.price.replace('000', 'k');
		let html = '<td class="sale_item">'+sale.item+'</td>'
			+ '<td class="sale_price">'+sale.price+'</td>'
			+ '<td class="sale_eta">'+sale.eta+'</td>'
		;
		$('#market #info').append('<tr>'+html+'</tr>');
	}		


	/* ----- Cephalon Simaris ----- */
	$('#simaris #info tr').remove();
	var simar = {
		'target': wf.simaris.target,
	}
	if (wf.simaris.isTargetActive)
		simar.active = "Active";
	else
		simar.active = "Inactive";
	simar.html = '<td class="simar_target"><a href="https://steamcommunity.com/sharedfiles/filedetails/?id=666483447" target="_blank">'+simar.target+'</a></td><td class="simar_active">'+simar.active+'</td>';
	$('#simaris #info').append('<tr>'+simar.html+'</tr>');

	
	/* ----- Finish ----- */
	//$('#header #refresh').css('color', 'rgb(0,155,0)');
	$('#header #refresh').css('opacity', '1');
	var d = new Date();
	var t = d.getTime();
	refresh.last = t;
	if (loading !== false)
		setTimeout(function () { loading = false; }, 9000);
});
};
get_data();


/* ----- Help ----- */
var help_open = function () { $('#preview_help').css('visibility', 'visible'); };
var help_close = function () {	$('#preview_help').css('visibility', 'hidden'); };





/* ----- Preview Void Stuff ----- */
var void_close = function () {
	$('#preview_void').css('visibility', 'hidden');
};
var void_open = function () {
	$('#preview_void').css('visibility', 'visible');
};




/* ----- Key binds ----- */
var kb = {
	'up': function () {
		$('body').animate({scrollTop: '0px'}, 250); 
	},
};
$(document).keydown(function(e) {
	// CTRL+R & F5
	if (e.keyCode == 116 || e.keyCode == 82 && e.ctrlKey && !e.shiftKey) {
		e.preventDefault();
		/*
		var d = new Date();
		var t = d.getTime();
		var diff = t-refresh.last;
		if (diff > 999)
			*/
			get_data();
		return false;
	}
	
	// ALT+UP/DOWN
	if (e.keyCode == 38 && e.altKey)
		collapse_all();
	if (e.keyCode == 40 && e.altKey)
		expand_all();
	
	// SHIFT+UP/DOWN
	if (e.keyCode == 38 && e.shiftKey)
		to_top();
	if (e.keyCode == 40 && e.shiftKey)
		to_bottom();
	
	// CTRL+UP/DOWN
	if (e.keyCode == 38 && e.ctrlKey) {
		e.preventDefault();
		let vol = Math.ceil(Number($('#volume').val())+1);
		if (vol <= 100 && vol >= 0) {
			$('#volume').val(vol);
			localStorage.setItem('msg.volume', vol);
		}
		return false;
	}
	if (e.keyCode == 40 && e.ctrlKey) {
		e.preventDefault();
		let vol = Math.ceil(Number($('#volume').val())-1);
		if (vol <= 100 && vol >= 0) {
			$('#volume').val(vol);
			localStorage.setItem('msg.volume', vol);
		}
		return false;
	}

    // ESC
    if (e.keyCode == 27) {
        void_close();
		help_close();
    }
});



/* ----- Header shrink ----- */
var scrollD = function () {
	$('#header').css('height', '40px').css('padding-top', '3px').css('font-size', '20px');
	$('#header #icons').css('top', '10px');
	$('#header img').css('height', '30px');
};

var scrollU = function () {
	$('#header').css('height', '80px').css('padding-top', '20px').css('font-size', '24px');
	$('#header #icons').css('top', '29px');
	$('#header img').css('height', '40px');
};

$(document).scroll(function(e) {
	$(window).scrollTop() > 10 ? scrollD() : scrollU();
});


/* ----- Fix mobile background issue ----- */
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

if (window.mobilecheck() === true) {
	$('html').css('background', 'black');
}
else
	speech.addqueue('hello');