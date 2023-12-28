export const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const lowercaseAlphabet = "abcdefghijklmnopqrstuvwxyz";
import postify1 from "./images/postify/postify_screenshot1.png";
import postify2 from "./images/postify/postify2.png";
import postify3 from "./images/postify/postify3.png";
import postify4 from "./images/postify/postify4.png";
import postify5 from "./images/postify/postify5.png";
import postify6 from "./images/postify/postify6.png";
import alfaglobe from "./images/alfaglobe/alfaglobe.png";
import alfaglobe2 from "./images/alfaglobe/alfaglobe2.png";
import alfaglobe3 from "./images/alfaglobe/alfaglobe3.png";
import alfaglobe4 from "./images/alfaglobe/alfaglobe4.png";
import multistepform from "./images/multistepform/multiform.png";
import multistepform2 from "./images/multistepform/multiform2.png";
import multistepform3 from "./images/multistepform/multiform3.png";
import multistepform4 from "./images/multistepform/multiform4.png";
import multistepform5 from "./images/multistepform/multiform5.png";
import movieapp from "./images/movieapp/movieapp.png";
import movieapp2 from "./images/movieapp/movieapp2.png";
import shopify from "./images/shopify/shopify2.png";
import shopify2 from "./images/shopify/shopify2.png";
import shopify3 from "./images/shopify/shopify3.png";
import shopify4 from "./images/shopify/shopify4.png";
import shopify5 from "./images/shopify/shopify5.png";
import shopify6 from "./images/shopify/shopify6.png";
import notes from "./images/notesapp/notes_screenshot.png";
import notes2 from "./images/notesapp/notes_Screenshot_2.png";
import notes3 from "./images/notesapp/notes_Screenshot_3.png";
import notes4 from "./images/notesapp/notes_Screenshot_4.png";
import notes5 from "./images/notesapp/notes_Screenshot_5.png";
import notes7 from "./images/notesapp/notes_Screenshot_7.png";
import piggame from "./images/piggame/piggame.png";
import piggame1 from "./images/piggame/piggame2.png";
import mapty from "./images/mapty/mapty.png";
import mapty2 from "./images/mapty/mapty2.png";

export const gitHubProjects = [
  {
    name: "Postify",
    route: "postify",
    description: "Social media app",
    largerDescription:
      "This is the latest project of me or our group (reactors), part of StarLabs internship. This project is a social media app in which you can sign in, register and post about your daily inspiration. Dont worry we can manage pictures, editing them, deleting them and many other things. Check it out...",
    live: false,
    languagesUsed: ["ReactJS", "Redux Toolkit", "ExpressJS", "CSS"],
    finished: true,
    images: [postify2, postify3, postify4, postify5, postify6],
    liveURL: null,
    githubURL: "https://github.com/endritbejta/postify-frontend",
  },

  {
    name: "Alfa Globe",
    route: "alfaglobe",
    description: "Gas station landing page",
    largerDescription:
      "An ongoing project of mine in which I try to present a gas company and its product. It is created using ReactJs. It a beautiful and user-friendly site in which you can see products, location and all of the extra info about the company",
    live: true,
    languagesUsed: ["JavaScript", "SCSS"],
    finished: false,
    images: [alfaglobe, alfaglobe2, alfaglobe3, alfaglobe4],
    githubURL: "https://github.com/endritbejta/alfa_globe.git",
    liveURL: "https://alfaglobe.netlify.app",
  },
  {
    name: "Pig game",
    route: "piggame",
    description: "Lets play a game!",
    largerDescription:
      "This is a game that is playing by rolling the dice and storing points to win the game...",
    live: true,
    languagesUsed: ["JavaScript", "CSS"],
    finished: true,
    images: [piggame, piggame1],
    githubURL: "https://github.com/endritbejta/pig-game",
    liveURL: "https://endrits-pig-game.netlify.app",
  },
  {
    name: "Mapty",
    route: "mapty",
    description: "Dont just run, track it!",
    largerDescription:
      "A small application done while finishing the JavaScript course, in which you can track the days your or cycle your way through the city",
    live: true,
    languagesUsed: ["JavaScript", "CSS"],
    finished: true,
    images: [mapty, mapty2],
    githubURL: "https://github.com/endritbejta/mapty",
    liveURL: "https://endrits-map-ty.netlify.app",
  },
  {
    name: "Notes app",
    route: "notesapp",
    description: "Your notes are safe with me",
    largerDescription:
      "This app was a part of a challegne i found online. It was created with ReactJS, Redux and react-router for routing. Here you can save your notes, classify them in folder, edit them and delete them.",
    live: true,
    languagesUsed: ["ReactJS", "Redux Toolkit", "SCSS"],
    finished: true,
    images: [notes, notes2, notes3, notes4, notes5, notes7],
    githubURL: "https://github.com/endritbejta/notes.git",
    liveURL: "https://save-notes-site.netlify.app",
  },
  {
    name: "Movie rating app",
    route: "movieratingapp",
    description: "Get yout movie ratings here",
    largerDescription:
      "A movie rating app, in which you can se some overviews of the latest trending movies and their rating. You can also search your favorite movie and see its rating. It was done using pure javascript and fetch APIs",
    live: true,
    languagesUsed: ["JavaScript", "CSS"],
    finished: true,
    images: [movieapp, movieapp2],
    githubURL: "",
    liveURL: "https://endrits-movie-rating-overview-app.netlify.app/",
  },
  {
    name: "Beauty shop",
    route: "beautyshop",
    description: "Online shop center",
    largerDescription:
      "An online shop center consisting of 3 pages, that were part of an assignment. It was created using pure JavaScript and SCSS. This is a rich in animations site, in which you can add item to the cart, remove them, view them in more detail for your extra information.",
    live: false,
    finished: false,
    images: [shopify, shopify2, shopify3, shopify4, shopify5, shopify6],
    languagesUsed: ["JavaScript", "CSS"],
    githubURL: "https://github.com/endritbejta/shopify-page-example",
    liveURL: "",
  },
  {
    name: "Multi step form",
    route: "multistepform",
    description: "You got some steps ? I got some forms!",
    largerDescription:
      "An online challegne which I succesfully reacreated using ReactJS. This form has for target larger coorporations, so it means it would be used on desktop only, hence the compability on desktop only",
    live: true,
    languagesUsed: ["ReactJS", "CSS"],
    finished: true,
    images: [multistepform2, multistepform3, multistepform4, multistepform5],
    githubURL: "https://github.com/endritbejta/multistepform.git",
    liveURL: "https://endrits-multistepform.netlify.app/",
  },
];
