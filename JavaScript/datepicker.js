const datelist = document.querySelector('.datelist');
const mainContainerElement = document.querySelector('.maintext-container');
const mainContentElement = document.querySelector('.maintext-content');
const datepicker = document.getElementById('datepicker');
const storedDatelistArray = JSON.parse(localStorage.getItem('stored-datelist')) || [];
const initialDate = '1 January, 2025';
const initialContent =  `Welcome! I am a cybersecurity student and I built this website as a way to learn more about web applications and their vulnerabilities. My goal is to be part of the online community, share what I've learned, and contribute in some small way. This site will feature a mix of writeups, challenges, and maybe even some technical deep dives.

Now, a quick guide to using this website: You can switch the theme by clicking the light switch icon in the bottom right. Your preferences will be saved, so when you return, you'll be presented with the last writeup you read. You can jump to different writeups by selecting the date on the top right of this page.

I chose not to use titles for these writeups because I wanted this site to be more than just another blog caught up in the attention economy. I wanted it to feel calm and real... a place that doesn't distract you mindlessly but invites you to explore with intention and curiosity. That's pretty much all this site does for now, but it still took me almost three months to build from scratch. 

If you're curious about the first write-up being dated January 1, 2025, it's just a coincidence. I didn't plan to put this site online on the first day of the year, but that's how it worked out. So yeah, that's all for now. As I continue adding content, I hope you'll get a better understanding of what this site is about and find something useful along the way. Thanks for sticking around!`;
// currentContentArray is declared as a window/gloabal element inside loadInitialContent()

function  loadInitialContent() {
    const lastReadWriteupDate = localStorage.getItem('writeup-date') || initialDate;
    const lastReadWriteupContent = localStorage.getItem('writeup-content') || initialContent;

    if (!lastReadWriteupDate){
        localStorage.setItem('writeup-date', initialDate);
    }

    if (!lastReadWriteupContent){
        localStorage.setItem('writeup-content', initialContent);
    }
    
    datepicker.innerHTML = lastReadWriteupDate; 
    const formattedContent = lastReadWriteupContent.replace(/\n/g, '<br>');
    mainContentElement.innerHTML = formattedContent;
    window.currentContentArray = mainContentElement.innerText.split('');
}


function blurMainText() {
    if (mainContainerElement) {
        mainContainerElement.style.filter = 'blur(1.5px)';
    }
}


function removeBlurMainText() {
    if (mainContainerElement) {
        mainContainerElement.style.transition = 'none';
        mainContainerElement.style.filter = 'none';
        
        setTimeout(() => {
            mainContainerElement.style.transition = 'filter 0.2s ease';
        }, 20); 
    }
}


const requestWriteup = async (writeupDate) => {
    try {
        if (writeupDate === initialDate){
            return initialContent;
        }

        const storedWriteup = localStorage.getItem(writeupDate);
        if (storedWriteup) {
            return JSON.parse(storedWriteup);
        }
        const writeupResponse = await fetch('https://theserver-pa9m.onrender.com/writeups', {
            method : 'GET',
            headers : {'Writeup-Date' : writeupDate},
            referrerPolicy: 'no-referrer'
        }); 

        if (!writeupResponse.ok){
            throw new Error('Failed to fetch content');
        }
        const content = await writeupResponse.json();
        return content.content ;
    }
    catch (error) {
        console.log("Error: ", error);
        return null; 
    }
} 

async function prefetchWriteups(dates) {
    const requests = dates.map(async (date) => {
        try {
            const writeup = await requestWriteup(date);  
            if (writeup) {
                localStorage.setItem(`${date}`, JSON.stringify(writeup));
            }
        } catch (error) {
            console.log(`Error fetching writeup for ${date}:`, error);
        }
    });

    await Promise.all(requests);
}


const requestDates = async () => {
    try {
        const response = await fetch('https://theserver-pa9m.onrender.com/dates');
        if (!response.ok) {
            throw new Error('Failed to fetch dates');
        }
        const dates = await response.json();
        const updatedDates = dates.map(date => date.filename);
        return updatedDates;

    } catch (error) {
        console.log("Error: ", error);
        return [];
    }
};


function sleep(ms) {    
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function animateText(currentWriteupArray, fetchedWriteup) {
    function getRandomCharacter() {
        const charCode = Math.floor(Math.random() * 26) + 97; 
        return String.fromCharCode(charCode);
      }


    function incrementCharacter(currentChar, targetChar) {
        if (currentChar === targetChar) return currentChar; 
        
        if (/[a-zA-Z]/.test(currentChar) && /[a-zA-Z]/.test(targetChar)) {
            const isUpperCase = targetChar === targetChar.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            const nextChar = String.fromCharCode(base + (currentChar.charCodeAt(0) - base + 1) % 26);
            return nextChar;
        }
        return targetChar;
    }


    while (currentWriteupArray.length < fetchedWriteup.length) currentWriteupArray.push(getRandomCharacter());
    while (currentWriteupArray.length > fetchedWriteup.length) currentWriteupArray.pop();
    
    while (currentWriteupArray.join('') !== fetchedWriteup) {
        let updated = false;
        
        for (let i = 0; i < currentWriteupArray.length; i++) {
            const currentChar = currentWriteupArray[i];
            const targetChar = fetchedWriteup[i];
            
            if (currentChar !== targetChar) {
                currentWriteupArray[i] = incrementCharacter(currentChar, targetChar);
                updated = true;
            }
        }

        if (updated) {
            mainContentElement.innerText = currentWriteupArray.join('');
            await sleep(25); 
        }
    }
    localStorage.setItem('writeup-content' , mainContentElement.innerHTML);
    localStorage.setItem('writeup-date' , datepicker.innerText)
}

const populateDateList = async () => {
    let storedDatelistArray = JSON.parse(localStorage.getItem('stored-datelist')) || [];
    let currentSelectedDate = datepicker.innerText;
    
    const renderDateList = (dates) => {
        datelist.innerHTML = "";
        dates
            .filter(date => date !== currentSelectedDate)
            .forEach(date => {
                const dateElement = document.createElement('div');
                dateElement.textContent = date;
                datelist.appendChild(dateElement);
                dateElement.addEventListener('click', async function () {
                    datepicker.innerText = this.innerText;
                    datelist.classList.remove('show');
                    setTimeout(() => {
                        datelist.style.display = 'none';
                        removeBlurMainText();
                    }, 200);
                    
                    const fetchedContent = await requestWriteup(datepicker.innerText);
                    
                    if (fetchedContent) {
                        animateText(currentContentArray, fetchedContent);
                    }
                    populateDateList(); 
                });
            });
        };
        
        if (storedDatelistArray.length > 0) {
            renderDateList(storedDatelistArray);
        }
        
        try {
            const fetchedDates = await requestDates();
            fetchedDates.sort((a, b) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return isNaN(dateA) || isNaN(dateB) ? 1 : dateA - dateB; 
            });
            renderDateList(fetchedDates);
            localStorage.setItem('stored-datelist', JSON.stringify(fetchedDates));
            return fetchedDates;
        } 
        catch (error) {
            console.error("Failed to fetch and update the datelist:", error);
            return [];
        }
};


const closeDateList = () => {
    if (datelist.classList.contains('show')) {
        datelist.classList.remove('show');
        setTimeout(() => {
            datelist.style.display = 'none';
        }, 200);
    }
};


const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            closeDateList();
            removeBlurMainText();
        }
    });
});


async function initializePage() {
    loadInitialContent();
    const dates = await populateDateList();
    if (dates) {
        await prefetchWriteups(dates); 
    }
}

initializePage();
observer.observe(datepicker);

// Event Listener for Datepicker Click
datepicker.addEventListener('click', (event) => {
    event.stopPropagation();
    if (datelist.classList.contains('show')) {
        removeBlurMainText();
        datelist.classList.remove('show');
        setTimeout(() => {
            datelist.style.display = 'none';
        }, 200);
    } else {
        blurMainText();
        datelist.style.display = 'block';
        setTimeout(() => {
            datelist.classList.add('show');
        }, 10);
    }
});

// Close the Date List When Clicking Outside
document.addEventListener('click', (event) => {
    if (!datepicker.contains(event.target) && !datelist.contains(event.target)) {
        if (datelist.classList.contains('show')) {
            datelist.classList.remove('show');
            setTimeout(() => {
                datelist.style.display = 'none';
                removeBlurMainText();
            }, 200);
        }
    }
});