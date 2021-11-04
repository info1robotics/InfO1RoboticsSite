<script>
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	let ready = false;
	onMount(() => ready = true);
	onMount.onload = function() {
		var navbar_logo = document.getElementById("navbar-logo");
		var navbar = document.getElementById("navbar");
	};
	function scrollPos() {
		return typeof onMount.pageYOffset != 'undefined' ? onMount.pageYOffset: document.documentElement.scrollTop? document.documentElement.scrollTop: document.body.scrollTop? document.body.scrollTop:0;
	}
	import Particles from "svelte-particles";
	  let particlesUrl = "http://foo.bar/particles.json";
	  let particlesConfig = {
		particles: {
		number: {
		  value: 600,
			},
		  color: {
			value: "#808080",
		  },
		  links: {
			enable: true,
			color: "#fff",
		  },
		  move: {
			enable: true,
		  },
		  size: {
						value: 4,
						random: true,
						minimumValue: 2,
						animation: {
							enable: true,
							speed: 40,
							minimumValue: 2,
							sync: false
						},
				}
		},
	  };
	  let onParticlesLoaded = (event) => {
		const particlesContainer = event.detail.particles;
		// you can use particlesContainer to call all the Container class
		// (from the core library) methods like play, pause, refresh, start, stop
	  };
	  let onParticlesInit = (main) => {
		// you can use main to customize the tsParticles instance adding presets or custom shapes
	  };
	</script>
	
	<!-- ----------------------------------------------------------------- -->
	<!-- ----------------------------------------------------------------- -->
	<!-- ----------------------------------------------------------------- -->
	
	<style>
	/* // -----------------------------------------------------------------------
	//                       Global CSS Styling
	// ----------------------------------------------------------------------- */
		:global(body) {
		  scroll-behavior: smooth; 
		  margin: 0;
		  padding: 0;
		  background-color: #15181e;
		  background-repeat:no-repeat;
		  background-size:cover;
		  background-position:center;
		  font-family: "orbitron";
		  overflow-x: hidden;
		  margin: 0;
		  padding: 0;
		}
		.anchor {
		  display: block;
		  position: relative;
		  visibility: hidden;
		}
	/* // -----------------------------------------------------------------------
	//               Navigation Bar Styling [Desktop]
	// ----------------------------------------------------------------------- */
		.nav {
		  z-index: 100;
		  padding-left: 4vh;
		  padding-right: 4vh;
		  height:7vh;
		  background-color:#15181e;
		  box-sizing: border-box;
		  position: fixed;
		  width: 100%;
		  transition: all 0.3s ease-in-out;
		}
		.nav a {
		  padding: 2.5vh 2.8vh 2.6vh 1.2vh;
		  float: right;
		  text-transform: uppercase;
		  font-size: 1.7vh;
		  font-weight: 500;
		  text-decoration: none;
		  color: #fff;
		  transition: all 0.2s ease-in-out;
		}
		
		.nav > .nav-logo {
		  padding: 1vh 0 3vh 5vh;
		  float: left;
		  position: relative;
		  left:5vh;
		}
		.nav-logo img {
		  height: 5vh;
		  margin: 0;
		  transition: all 0.3s ease-in-out;
		}
		img:hover {
	  transform: rotate(360deg);
	}
		  .nav a{font-size:1.5vh;}
		.nav a:hover {transform: scale(1.2);}
		.nav > .nav-active {color: #39b44a;}
		@media only screen and (max-width:1000px) {
		.nav{
			display: none;
	  }
	}
	.nav a{
		float:center;
		font-size: 1.3vh;
		}
	/* // -----------------------------------------------------------------------
	//                Navigation Menu Styling [Mobile]
	// ----------------------------------------------------------------------- */
	@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap');
	.wrapper{
	  z-index:200;
	  position: fixed;
	  top: 0;
	  left: 0;
	  height: 100%;
	  width: 100%;
	  background: linear-gradient( #39b44a, #0B6623);
	  clip-path: circle(25px at calc(100% - 60px) 4.5vh);
	  transition: all 0.3s ease-in-out;
	}
	#active:checked ~ .wrapper{clip-path: circle(75%);}
	.menu-btn{
	  position: fixed;
	  z-index: 201;
	  right: 1.4vh;
	  top: 2vh;
	  height: 5vh;
	  width: 5vh;
	  text-align: center;
	  line-height: 5vh;
	  border-radius: 50%;
	  font-size: 2vh;
	  color: #fff;
	  cursor: pointer;
	  background: #15181e;
	  transition: all 0.3s ease-in-out;
	}
	#active:checked ~ .menu-btn{
	  background: #fff;
	  color: #39b44a;
	}
	#active:checked ~ .menu-btn i:before{
	  content: "\f00d";
	}
	.wrapper ul{
		position: relative;
	  top: 50%;
	  list-style: none;
	  text-align: center;
	  
	}
	.wrapper ul li{
	  margin: 15px 0;
	  
	}
	.wrapper ul li a{
	  color: none;
	  text-decoration: none;
	  font-size: 4vh;
	  font-weight: 500;
	  padding: 5px 30px;
	  color: #fff;
	  position: relative;
	  line-height: 5vh;
	  transition: all 0.3s ease;
	}
	.wrapper ul li a:after{
	  position: absolute;
	  content: "";
	  background: #000;
	  width: 100%;
	  height: 100px;
	  left: 0;
	  border-radius: 50px;
	  transform: scaleY(0);
	  z-index: -1;
	  transition: transform 0.3s ease;
	}
	.wrapper ul li a:hover:after{transform: scaleY(1);}
	.wrapper ul li a:hover{color: #fff;}
	input[type="checkbox"]{display: none;}
	@media (min-width: 60vh) {
		.wrapper{display:none;}
		.menu-btn{display:none;}}
	/* // -----------------------------------------------------------------------
	//                      Splashscreen Styling
	// ----------------------------------------------------------------------- */
		.splash {
		  width: 100%;
		  height: 100%;
		  overflow-x: visible;
		  display: flex;
		}
		.splash-title {
		  box-sizing: border-box;
		  padding-top: 10%;
		  padding-left: 7.5%;
		  position:absolute;
		  top: 40%;
		  -ms-transform: translateY(-50%);
		  transform: translateY(-50%);
		}
		.splash-title h1 {
			color:#15181e;
		  text-align: unset; 
		  font-weight: 500;
		  font-size: 500%;
		  line-height: 0.4;
		}
		.splash-title p {
			color:#15181e;
		  margin-top: -10px;
		  font-size: 24px;
		  text-transform: uppercase;
		}
		.splash img {
		  align-self: center;
		  margin: 0 0 0 50px;
		  width: 50%;
		  object-fit: contain;
		}
		
		.splash-title b {
		  color: #0b6623;
		  font-weight: 700;
		}
			
		@media only screen and (max-width: 1000px) {
		.splash-title h1{
		font-size:1000%;
		}
		.splash-title p{
			color:#15181e;
			font-size:48px;
		}
	}
	/* // -----------------------------------------------------------------------
	//                     About Section Styling
	// ----------------------------------------------------------------------- */
		
		.about {
			height:150vh;
			position:relative;
			top:10vh;
		}
		.about img{
	  border-width: 0.5vh;
	  border-style: solid ;
	  border-image: linear-gradient(to right, #0B6623, #9bcc33) 1;
		}
		h1 {
		  text-align: center;
		  font-size: 42px;
		  font-weight: 600;
		  font-family:"orbitron";
		}
		.about h1{
			position:relative;
			top:-5vh;
		}
		.about p {
		  text-align: left;
		  font-size: 2.6vh;
		  font-family: "Share Tech Mono";
		  text-align: center;
		}
		.align1{
			
			padding-left: 10vw;
			  padding-right: 40vw;
			margin-top:15vh;
		}
		.align2{
			margin-top:17vh;
			padding-left: 40vw;
			padding-right: 15vw;
		}
		.align3{
			padding-left: 10vw;
			padding-right: 40vw;
			margin-top:20vh;
		}
		.align4{
			text-align: center;
			margin-top:10vh;
			padding-left: 20vw;
			padding-right: 20vw;
		}
		.aboutimage1 img{
			position:relative;
			margin-top:-25vh;
			border-radius: 0px;
			margin-left:65vw;
			width:20vw;
			height: auto;
			display: flex;
			   align-items:center;
		}
		.aboutimage2 img{
			position:relative;
			border-radius: 0px;
			margin-left:10vw;
			margin-top:-25vh;
			width:20vw;
			height: auto;
			display: flex;
			   align-items:center;
		}
		.aboutimage3 img{
			position: relative;
			margin-top:-25vh;
			border-radius: 0px;
			margin-left:65vw;
			width:20vw;
			height: auto;
			display: flex;
			   align-items:center;
		}
		.about b{color:#39b44a;}
		@media only screen and (max-width: 1000px) {
		.aboutimage1 img{
		padding-left: 0;
		padding-right: 0;
		margin-left: auto;
		margin-right: auto;
		margin-top:0vh;
		width:60vw;
		left: 0;
		right: 0;
		text-align: center;
		border-radius: 0px;
		}
		.aboutimage2 img{
		padding-left: 0;
		padding-right: 0;
		margin-left: auto;
		margin-right: auto;
		margin-top:auto;
		width:60vw;
		left: 0;
		right: 0;
		text-align: center;
		border-radius: 0px;
		}
		.aboutimage3 img{
		padding-left: 0;
		padding-right: 0;
		margin-left: auto;
		margin-right: auto;
		margin-top:0vh;
		width:60vw;
		left: 0;
		right: 0;
		text-align: center;
		border-radius: 0px;
		}
		.about p{
			font-size:1.5vh;
		}
		.align1{
			text-align:center;
			padding-left: 10vw;
			  padding-right: 10vw;
			margin:0;
		}
		.align2{
			margin-left:0;
			text-align:center;
			padding-left: 10vw;
			  padding-right: 10vw;
			margin-top:0vh;
		}
		.align3{
			margin-top:0vh;
			text-align:center;
			padding-left: 10vw;
			  padding-right: 10vw;
		}
		.align4{
			margin-top:0vh;
			text-align:center;
			padding-left: 10vw;
			  padding-right: 10vw;
		}
	}
	/* // -----------------------------------------------------------------------
	//                 Terminal Style Cursor Effect
	// ----------------------------------------------------------------------- */
		.terminal {animation: blink 1s infinite step-end;}
	@keyframes blink {from,           to { opacity: 0; }          50% {opacity: 1;}}
	/* // -----------------------------------------------------------------------
	//                   CAD Aligment and Responsive Design
	// ----------------------------------------------------------------------- */
		.alignCAD{
		width: 100%;
		position: absolute;
		  left: 45%;
		top: 55%;
		-ms-transform: translateY(-50%);
		transform: translateY(-50%);
		}
		.splash{
			height: 100vh;
			width:100%;	
		}
		.aboutus{
			height:100vh;
			color:#fff;
			position:relative;
		}
		@media (max-width: 60vh) {
		.alignCAD img{
		display: none;
		}
	}
		@media only screen and (max-width: 1000px) {
		.alignCAD{
			top:35vh;
		}
	}
	/* // -----------------------------------------------------------------------
	//               Splashscreen Background Animation
	// ----------------------------------------------------------------------- */
	.area{
		background: #39b44a;  
		background: -webkit-linear-gradient(to left, rgb(10, 124, 0), rgb(17, 88, 27)); 
		width: 100%;
		height:100vh;
		overflow: hidden;
		position: absolute;
		background-position: center center;
	}
	.circles{
		background-position: center center;
		position: absolute;
		top: 5;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}
	.circles li{
		position: absolute;
		display: block;
		list-style: none;
		width: 20px;
		height: 20px;
		background: rgba(255, 255, 255, 0.479);
		animation: animate 25s linear infinite;
		bottom: -150px;
		
	}
	.circles li:nth-child(1){
		left: 25%;
		width: 80px;
		height: 80px;
		animation-delay: 0s;
	}
	.circles li:nth-child(2){
		left: 10%;
		width: 20px;
		height: 20px;
		animation-delay: 2s;
		animation-duration: 12s;
	}
	.circles li:nth-child(3){
		left: 70%;
		width: 20px;
		height: 20px;
		animation-delay: 4s;
	}
	.circles li:nth-child(4){
		left: 40%;
		width: 60px;
		height: 60px;
		animation-delay: 0s;
		animation-duration: 18s;
	}
	.circles li:nth-child(5){
		left: 65%;
		width: 20px;
		height: 20px;
		animation-delay: 0s;
	}
	.circles li:nth-child(6){
		left: 75%;
		width: 110px;
		height: 110px;
		animation-delay: 3s;
	}
	.circles li:nth-child(7){
		left: 35%;
		width: 150px;
		height: 150px;
		animation-delay: 7s;
	}
	.circles li:nth-child(8){
		left: 50%;
		width: 25px;
		height: 25px;
		animation-delay: 15s;
		animation-duration: 45s;
	}
	.circles li:nth-child(9){
		left: 20%;
		width: 15px;
		height: 15px;
		animation-delay: 2s;
		animation-duration: 35s;
	}
	.circles li:nth-child(10){
		left: 85%;
		width: 150px;
		height: 150px;
		animation-delay: 0s;
		animation-duration: 11s;
	}
	@keyframes animate {
		0%{
			transform: translateY(0) rotate(0deg);
			opacity: 1;
			border-radius: 0;
		}
		100%{
			transform: translateY(-1000px) rotate(720deg);
			opacity: 0;
			border-radius: 50%;
		}
	}
	* {
	  box-sizing: border-box;
	}
	/* The actual timeline (the vertical ruler) */
	.timelineh {
		position:relative;
		text-align: center;
		font-weight: 600;
		font-family:"orbitron";
		position:relative;
		color:#fff;
		margin:auto;
		top:60vh;
		}
	.timelineh b{
		color:#39b44a;
	}
	@media only screen and (max-width: 1024px) {
	.timelineh{
		top:35vh;
	}
	@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait) {
	.timelineh{
		top:57vh;
	}
	}
	}
	.timeline img{
		position:absolute;
		left:50%;
		transform: translateX(-50%);
		border-width: 4px;
	  border-style: solid;
	  border-image: linear-gradient(to right, #0B6623, #9bcc33) 1;
	  margin-top:2vh;
	  background:#fff;
	}
	.timeline h2{
		color:#15181e;
	}
	.timeline {
	position: relative; 
		margin-top:5vh;
	  left: 0; 
	  right: 0; 
	  margin-left: auto; 
	  margin-right: auto; 
	  max-width: 1500px;
	  font-family:"Share Tech Mono";
	}
	@media only screen and (min-width: 1000px) {
		.timeline{
		top:55vh;
		}
		.timelineh h1{
		top:-7vh;
		}
	}
	@media only screen and (max-width: 1000px) {
		.timeline{
		top:35vh;
		}
	}
	@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait) {
		.timeline{
		top:60vh;
		}
		.alignCAD img{
			display:none;
		}
	}
	/* The actual timeline (the vertical ruler) */
	.timeline::after {
	  content: '';
	  position: absolute;
	  width: 6px;
	  background-color:#d0d3e1;
	  top: 0;
	  bottom: 0;
	  left: 50%;
	  margin-left: -3px;
	}
	/* Container around content */
	.container {
	  padding: 10px 40px;
	  position: relative;
	  background-color: inherit;
	  width: 50%;
	}
	/* The circles on the timeline */
	.container::after {
	  content: '';
	  position: absolute;
	  width: 25px;
	  height: 25px;
	  right: -17px;
	  background-color: #39b44a;
	  border: 4px solid #d0d3e1;
	  top: 15px;
	  border-radius: 50%;
	  z-index: 1;
	}
	/* Place the container to the left */
	.left {
	  left: 0;
	}
	/* Place the container to the right */
	.right {
	  left: 50%;
	}
	/* Add arrows to the left container (pointing right) */
	.left::before {
	  content: " ";
	  height: 0;
	  position: absolute;
	  top: 22px;
	  width: 0;
	  z-index: 1;
	  right: 30px;
	  border: medium solid #39b44a;
	  border-width: 10px 0 10px 10px;
	  border-color: transparent transparent transparent #39b44a;
	}
	/* Add arrows to the right container (pointing left) */
	.right::before {
	  content: " ";
	  height: 0;
	  position: absolute;
	  top: 22px;
	  width: 0;
	  z-index: 1;
	  left: 30px;
	  border: medium solid #39b44a;
	  border-width: 10px 10px 10px 0;
	  border-color: transparent #39b44a transparent transparent;
	}
	/* Fix the circle for containers on the right side */
	.right::after {
	  left: -16px;
	}
	.rightimg{
		left: 50%;
	}
	.containerimg{
		padding: 10px 40px;
	  position: relative;
	  background-color: inherit;
	  width: 50%;
	}
	/* The actual content */
	.content {
	  padding: 20px 30px;
	  background-color: #39b44a;
	  position: relative;
	  border-radius: 15px;
	}
	/* Media queries - Responsive timeline on screens less than 600px wide */
	@media only screen and (max-width: 1024px) {
	  /* Place the timelime to the left */
	  .timeline::after {
	  left: 31px;
	  }
	  .timeline img{
		  display:none;
	  }
	  /* Full-width containers */
	  .container {
	  width: 100%;
	  padding-left: 70px;
	  padding-right: 25px;
	  }
	  
	  /* Make sure that all arrows are pointing leftwards */
	  .container::before {
	  left: 60px;
	  border: medium solid #404040;
	  border-width: 10px 10px 10px 0;
	  border-color: transparent #39b44a transparent transparent;
	  }
	  /* Make sure all circles are at the same spot */
	  .left::after, .right::after {
	  left: 15px;
	  }
	  
	  /* Make all right containers behave like the left ones */
	  .right {
	  left: 0%;
	  }
	}
	hr.new5 {
	  border: 3px solid #d0d3e1;
	  border-radius: 3px;
	  width:400px;
	}
	@media only screen and (max-width: 1000px) {
	hr.new5{
		width:100%;
	}
	}
	/* // -----------------------------------------------------------------------
	// -----------------------------------------------------------------------
	// ----------------------------------------------------------------------- */
	.img2021 img{
		width:400px;
		height:auto;
	}
	.img2020 img{
		height:auto;
		width:370px;
	}
	.img2019 img{
		height:auto;
		width:350px;
	}
	.img2018 img{
		height:auto;
		width:330px;
	}
	@media only screen and (min-width: 768px) {
	.img2020 img{
		margin-top:3vh;
	}
	.img2019 img{
		margin-top:2vh;
	}
	.img2021 img{
		height:170px;
		width:auto;
	}
	}
	.linkssection {
	 position:relative;
	 top:75vh;
		
	}
	.linkssection img{
		position:relative;
		width:19.5vw;
		height:auto;
	}
	.logosection{
	position:relative;
	 top:70vh;	
	}
	.logosection img{
		height:auto;
		width:32vw;
	}
	@media only screen and (max-width: 1000px) {
		.linkssection{
			top:50vh;
		}
	}
	@media only screen and (max-width: 1000px) {
		.logosection{
			top:45vh;
		}
	}
	@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: portrait) {
		.linkssection{
			top:70vh;
		}
		.logosection{
			top:65vh;
		}
	}
	#tsparticles {
	  position: absolute;
	  width: 100%;
	  height: 319vh;
	  top: 100vh;
	  left: 0;
	  margin: 0;
	}
	@media only screen and (max-width: 1000px) {
	#tsparticles{
	display:none;
	}
	}
	</style>
	
	
	<svelte:head>
		<title>InfO(1)Robotics</title>
	</svelte:head>
	
	
	<main>
	
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Orbitron&family=Roboto+Mono:wght@100&family=Share+Tech+Mono&display=swap" rel="stylesheet">
		<meta name="viewport" content="user-scalable=0;"/><div class="HTML">
		
		<!-- Desktop Navigation Bar -->
		
		  <nav class="nav" id="navbar">
			<a href="/members">>Members<span class="terminal">_</span></a>
			<a href="/" class="nav-active">>Home<span class="terminal">_</span></a>
			<a class="nav-logo" href="/">
			<img src="https://drive.google.com/uc?id=1eK_A6X-RjwRQrR1Ek0tPIGPCJonpFCB6" id="navbar-logo" alt='Logo'></a>
		  </nav>
		  <div id="main">
		  </div>
	
	
	
		<!-- Mobile Navigation Menu -->
	
		  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"/>
		  <input type="checkbox" id="active">
		  <label for="active" class="menu-btn"><i class="fas fa-bars"></i></label>
		  <div class="wrapper">
			 <ul>
				<li><a href="/">Home</a></li>
				<li><a href="/members">Members</a></li>
			 </ul>
		  </div>
	
		<!-- Splash Screen-->
	
		<!-- Background Animation -->
	
		  <div class="splash"> 
		  <div class="splash" id="home">{#if ready}
			<div class="area">
				<ul class="circles">
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
						<li></li>
				</ul>
	
		
	
		</div >{/if}
				{#if ready}
			<span class="splash-title">
	
			  <h1 transition:fly="{{ x: -200, duration: 1500 }}">Inf<b>O(1)</b></h1>
			  <h1 transition:fly="{{ x: -200, duration: 1500 }}">Robotics</h1>
			<!-- <Typewriter interval={100}> --><p transition:fly="{{ x: -200, duration: 1500 }}">>Education Through Innovation<span class="terminal">_</span></p>
			</span>{/if}
			<div class="always-visible">
				{#if ready}
				  <div class="visible-on-mount"><div class="alignCAD"><img src="/fancy-cad.png" alt='CAD' transition:fly="{{ x: 200, duration: 1500 }}"></div></div>
				{/if}
			  </div>
		  </div></div>
	
		<div id = "tsparticles">
		  <Particles id="tsparticles" options="{particlesConfig}" />
		</div>
		
	
		  <div class="aboutus">
		  <div class="about">
			<span class="anchor" id="about" style="top: -80px"></span>
			<h1>>We are <b>InfO(1)Robotics</b><span class="terminal">_</span></h1>
			
				
			<div class="align1">	
			  <p>><b>We</b> are the <b>infO(1)Robotics</b> Team – RO 140 - from “Ion Luca Caragiale”
			  High School, Ploiesti, Romania. Our team started out in April
			  2018, and it is coordinated by our main mentor Daniela Lica, a Computer
			  – Programming teacher<span class="terminal">_</span>
			<br></p></div><div class="aboutimage1"><img src="https://drive.google.com/uc?id=1yYDLN_bqERWztm8rxMrc_bUgo9clK67s" alt="Soare"></div>
				
			<div class="align2">
				<p>><b>Our team</b> is composed of 15 members and 59 volunteers and each of them is currently
				working in the STEM fields with extracurricular activities which fit their sub-teams.
				<b>We</b> started out with no budget and has been gradually building up its financial
				resources<span class="terminal">_</span></p></div><div class="aboutimage2"><img src="https://drive.google.com/uc?id=1iwT46RFVkILqR-dxMtPBbKUQmC8J6ciy" alt="Soare"></div>
			
			<div class="align3">
				<p>><b>infO(1)Robotics</b> is currently participating at <b>FIRST Tech Challenge</b> and expects to
				develop a greater knowledge for the future’s main goal: Robots and Artificial
				Intelligence<span class="terminal">_</span></p></div><div class="aboutimage3"><img src="https://drive.google.com/uc?id=1hPpclnJtxSNy_5i2B401_ZemVs5Nywu2" alt="Soare"></div>
			<div class="align4">
				<p>><b>We</b> combine work and pleasure, we <b>as a team</b> 
				always train hard but in an enjoyable way. By
				sharing opinions and learning about team work, we believe we can get creative
				enough to someday find a revolutionary and feasible idea of a robot that could
				unbelievably save humanity in its own way<span class="terminal">_</span></p></div>
	
				</div></div>
	<div class="timelineh"><h1>>Our <b>Time</b>line<span class="terminal">_</span></h1></div>
	<div class="timeline">
	
			<hr class="new5">

		<div class="containerimg rightimg"><div class="img2021"><img src="https://drive.google.com/uc?id=1_R1bsSBSqfF8rhSt4FafN7Y3Afj5O_Rn" alt="SampleImage"></div>
		</div>
	
		<div class="container left">
		  <div class="content">
			<h2 style="font-family:'orbitron'">>2021 - PRESENT<span class="terminal">_</span></h2>
			<p>>Currently, with new members on the team, Inf0(1) Robotics is looking forward to competing in this season 🚀<span class="terminal">_</span></p>
	
		</div>		<div class="img2020"><img src="https://drive.google.com/uc?id=1qDQRSh6dztFb6mhB0DBBuZ0Qshy6AbpK" alt="SampleImage"></div> 
		</div>
	
		<div class="container right">
		
		  <div class="content">
			<h2 style="font-family:'orbitron'">>2020-2021<span class="terminal">_</span></h2>
			<p>>As the pandemic continued, Ultimate Goal has been a challenging season where demos and events were held remote.
				 In that season we created Po(1)cast where we invited a lot of teams and members from the FTC community.
				At the Bucharest Regional, Inf0(1) Robotics won Control Award for its robot great autonomous period<span class="terminal">_</span></p>
			
		</div><div class="img2019"><img src='https://drive.google.com/uc?id=1Vs3KkUy1Wm9GGj3uIti9xb91cgB6r1aB' alt="SampleImage" > </div>
		</div>
		<div class="container left">
		  <div class="content">
			<h2 style="font-family:'orbitron'">>2019-2020<span class="terminal">_</span></h2>
			<p>>During the Skystone season, Inf0(1) Robotics created numerous events (e.g. Inf0(1) Talks, Inf0(1) Demo, etc.) and won a great deal 
				of demos (e.g. Qube Demo, RobotX Demo etc.). When the pandemic started, we decided to create plastic face-shields for medical staff in 
				need. We donated a total of 2401 face-shields to 32 institutions. Inf0(1) Robotics won Inspire 1 at Bucharest Regional<span class="terminal">_</span></p>
	
		</div>		<div class="img2018"><img src="https://drive.google.com/uc?id=1rTjrxJEGrnxSmTOQvaz8h2U3Rw2fjht5" alt="SampleImage"> </div>
		</div>
		<div class="container right">
		  <div class="content">
			<h2 style="font-family:'orbitron'">>2018-2019<span class="terminal">_</span></h2>
			<p>>Inf0(1) Robotics estabilished in late octomber and, as rookies, we faced a lot of problems. Despite our first year, we won the Bucharest
				 Regional as 2nd pick anfd at the National Stage, we won Inspire 3<span class="terminal">_</span></p>
		</div>
		</div>
		<br>
		<hr class="new5" style="width:100%">
	</div>
	
	<div class="logosection">
		<a href="http://www.cn-caragiale.ro/"><img src="https://drive.google.com/uc?id=1qmTs5j8PyzxNZhE41bgmG_tiLSgFzrJN" alt="INSTAGRAM"></a>
		<a href="https://natieprineducatie.ro/"><img src="https://drive.google.com/uc?id=1wl1WxYU-KNe5f72ATPCTDAzOvBTiDq31" alt="FTC" style="margin-left:1%;"></a>
		<a href="https://www.instagram.com/info1robotics/"><img src="https://drive.google.com/uc?id=1hGjq4VzAa9Xrz8v5uSjvWk1T2qNpZkPn" alt="INSTAGRAM"></a>
	</div>
	<div class="linkssection">
		<a href="https://www.instagram.com/info1robotics/"><img src="https://drive.google.com/uc?id=1cMI5UrBOrvltwZ090ys5m7wCe4c1u4fd" alt="INSTAGRAM"></a>
		<a href="https://www.facebook.com/info1robotics/"><img src="https://drive.google.com/uc?id=1YDEBin_npoElopwus2CouhVJqNORE8aM" alt="FACEBOOK"></a>
		<a href="https://www.youtube.com/channel/UC6PkNCRNEQOfKuciVltqzTQ"><img src="https://drive.google.com/uc?id=1HndKVFjySGNx1edEEH9OXP7zRnRA4qUG" alt="YOUTUBE"></a>
		<a href="https://open.spotify.com/show/6glFbyo8OnIqih7RuPjB1e"><img src="https://drive.google.com/uc?id=1ki_ydOgY3Kz7qzI3m12DP1EgLvndMa6B" alt="SPOTIFY"></a>
		<a href="mailto: info1robotics@gmail.com"><img src="https://drive.google.com/uc?id=17d8EWjB6gFm1NVgigRpdm1iHloEFQDIk" alt="EMAIL"></a>
	</div>
	
	
	</main>