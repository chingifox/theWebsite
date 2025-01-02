window.addEventListener('scroll', function() {
    const element = document.getElementById("blurstart");
    const topBlur = document.getElementById("topblur");

    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const scrollWheelPosition = window.scrollY;
    
    const maxHeight = 8; 
    const scrollRange = 300; 
    const distanceScrolled = Math.min(scrollRange, elementTop - scrollWheelPosition);

    let blurHeight = (1 - distanceScrolled / scrollRange) * maxHeight;
    blurHeight = Math.max(1, Math.min(blurHeight, maxHeight));
    topBlur.style.height = `${blurHeight}vh`;
    if (scrollWheelPosition === 0){
        topBlur.style.height= '0vh';
    }
    
});
