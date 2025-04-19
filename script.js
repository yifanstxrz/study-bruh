document.addEventListener("DOMContentLoaded", function () {
  // All quotes embedded directly in the JavaScript
  const quotes = [
    '"Success is the sum of small efforts, repeated day in and day out." – Robert Collier',
    '"Discipline is choosing between what you want now and what you want most." – Abraham Lincoln',
    '"Don\'t watch the clock; do what it does. Keep going." – Sam Levenson',
    '"The secret of getting ahead is getting started." – Mark Twain',
    '"Study while others are sleeping; work while others are loafing." – Napoleon Hill',
    '"Little by little, one travels far." – J.R.R. Tolkien',
    '"You don\'t have to be extreme, just consistent."',
    '"It always seems impossible until it\'s done." – Nelson Mandela',
    '"The earlier you start, the better you get."',
    '"Work hard in silence. Let success be your noise." – Frank Ocean',
    '"Push yourself, because no one else is going to do it for you."',
    '"Wake up with determination, go to bed with satisfaction."',
    "\"Don't stop when you're tired. Stop when you're done.\"",
    '"Success doesn\'t come from what you do occasionally. It comes from what you do consistently." – Marie Forleo',
    '"You are capable of more than you know." – Glenda Hatchett',
    '"Do something today that your future self will thank you for." – Sean Patrick Flanery',
    '"Be stronger than your excuses."',
    '"The difference between ordinary and extraordinary is that little extra." – Jimmy Johnson',
    '"Winners are not people who never fail but people who never quit."',
    '"Great things are done by a series of small things brought together." – Vincent Van Gogh',
    '"Believe you can and you\'re halfway there." – Theodore Roosevelt',
    '"Hard work beats talent when talent doesn\'t work hard." – Tim Notke',
    '"Motivation gets you started. Habit keeps you going." – Jim Ryun',
    '"Doubt kills more dreams than failure ever will." – Suzy Kassem',
    '"Don\'t limit your challenges. Challenge your limits." – Jerry Dunn',
    '"Success is not for the lazy."',
    '"You don\'t always get what you wish for. You get what you work for."',
    '"The pain you feel today will be the strength you feel tomorrow."',
    '"There is no elevator to success. You have to take the stairs." – Zig Ziglar',
    '"Perseverance is not a long race; it is many short races one after another." – Walter Elliot',
    "\"If it doesn't challenge you, it won't change you.\" – Fred DeVito",
    '"Dream big. Start small. Act now." – Robin Sharma',
    '"The expert in anything was once a beginner." – Helen Hayes',
    '"Success is the result of preparation, hard work, and learning from failure." – Colin Powell',
    '"Be so good they can\'t ignore you." – Steve Martin',
    '"You miss 100% of the shots you don\'t take." – Wayne Gretzky',
    '"Don\'t wish it were easier; wish you were better." – Jim Rohn',
    '"Never let the fear of striking out keep you from playing the game." – Babe Ruth',
    '"Worry less, study more."',
    '"Your future is created by what you do today, not tomorrow."',
    '"Stop doubting yourself. Work hard and make it happen."',
    '"You were born to be real, not perfect."',
    '"Great things never come from comfort zones."',
    '"Success doesn\'t come overnight. Keep going."',
    '"Good things come to those who hustle."',
    '"The harder you work for something, the greater you\'ll feel when you achieve it."',
    '"Stay focused and never give up."',
    '"Study like there\'s no tomorrow."',
    '"The key to success is to start before you\'re ready." – Marie Forleo',
    '"You don\'t need to be perfect, just keep showing up."',
    '"Fall seven times, stand up eight." – Japanese Proverb',
    '"Learning never exhausts the mind." – Leonardo da Vinci',
    '"Don\'t let what you cannot do interfere with what you can do." – John Wooden',
    '"Focus on progress, not perfection."',
    '"Nothing will work unless you do." – Maya Angelou',
    '"Success usually comes to those who are too busy to be looking for it." – Henry David Thoreau',
    '"Study hard, no matter how hard it gets."',
    '"You can if you think you can." – George Reeves',
    '"The best view comes after the hardest climb."',
    '"Stars can\'t shine without darkness."',
    '"Difficult roads often lead to beautiful destinations."',
    '"Don\'t ruin a good today by thinking about a bad yesterday."',
    '"Every accomplishment starts with the decision to try."',
    '"You\'ve got what it takes."',
    '"Be proud of how far you\'ve come, and have faith in how far you can go."',
    '"Your only limit is your mind."',
    '"Success is a journey, not a destination." – Arthur Ashe',
    '"Don\'t be afraid to give up the good to go for the great." – John D. Rockefeller',
    '"If you want it, work for it."',
    '"Nothing great ever came from easy."',
    '"The way to get started is to quit talking and begin doing." – Walt Disney',
    '"Study now so you don\'t struggle later."',
    '"Just one more page. Just one more hour. Just one more step."',
    '"Education is the passport to the future." – Malcolm X',
    '"Learning is a treasure that will follow its owner everywhere." – Chinese Proverb',
    '"Success is not in what you have, but who you are." – Bo Bennett',
    '"Strive for progress, not perfection."',
    '"Great minds are always learning."',
    '"Choose your hard. Failing is hard, but so is pushing through."',
    '"Push the limits of what you think you can do."',
    '"One day or day one. You decide."',
    '"You\'re doing better than you think."',
    '"The secret to studying is to start."',
    '"Read. Study. Learn. Grow."',
    '"Success is built on late nights and early mornings."',
    '"Sacrifice a few lazy days now to enjoy your future forever."',
    '"Everything you want is on the other side of effort."',
    '"Don\'t study to pass. Study to understand."',
    '"Winners focus on winning. Losers focus on winners."',
    '"Set a goal that makes you want to jump out of bed."',
    '"Stay positive. Work hard. Make it happen."',
    "\"Success isn't always about greatness. It's about consistency.\" – Dwayne Johnson",
    '"You didn\'t come this far to only come this far."',
    '"Be patient. Study harder. Believe in yourself."',
    '"Turn the pain of studying into the pride of results."',
    '"Smart is something you become, not something you are."',
    '"Hard work is the price we must pay for success." – Vince Lombardi',
    '"Study like a champion today."',
    "\"Today's pain is tomorrow's power.\"",
    '"Focus on the goal, not the struggle."',
    '"Prove to yourself that you can do it."',
    '"Make each study session count."',
    '"Keep showing up, even when it\'s hard."',
    '"You are closer than you think."',
  ];

  function displayRandomQuote() {
    // Select a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Update the text in the big-text div
    const quoteElement = document.getElementById("random-quote");
    if (quoteElement) {
      quoteElement.textContent = randomQuote;
    } else {
      console.error("Could not find element with id 'random-quote'");
    }
  }

  // Actually call the function to display a random quote
  displayRandomQuote();
});

document.getElementById("menuButton").addEventListener("click", function () {
  document.getElementById("fullMenu").style.top = "10%"; // Moves it down smoothly
});

document.getElementById("closeMenu").addEventListener("click", function () {
  document.getElementById("fullMenu").style.top = "-100vh"; // Slides it back up
});
