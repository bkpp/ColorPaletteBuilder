
(function () {
    
    let currentNumberOfColorsInPalette = 5
    const defaultNumberOfColorsInPalette = 5
    const maxAllowedNumberOfColorsInPalette = 10
    
    const colorPaletteContainer = document.querySelector(".color-palette-container")

    const colorsFromHashParams = () => {
        const params = window.location.hash.substring(1);
        return params.length > 0 ? params.split("-").map(c => `#${c}`): []
    }
    
    const colorPaletteComponent = (colorHex, textColor = "#000000") =>
    {
        const componentHtml = 
            `<div class="color-palette-item" style="background-color:${colorHex};color:${textColor};">
                <div class="color-palette-item-operations">
                    <div class="delete-button" data-operation="delete">
                        <i class="fa-regular fa-trash-can"></i>
                    </div>
                    <div class="copy-button" data-operation="copy">
                        <i class="fa-regular fa-paste"></i>
                    </div>
                </div>
                
                <div class="color-code" data-operation="copy">${colorHex}</div>

                <div class="color-palette-item-operations">
                    <div class="lock-button" data-operation="lock">
                        <i class="fa-solid fa-lock-open"></i>
                    </div>                    
                </div>
            </div>`
        
        const templateElement = document.createElement("div")
        templateElement.innerHTML = componentHtml;
        return templateElement.firstElementChild;
    }

    function generateRandomColor()
    {
        const hexCode = "0123456789ABCDEF"
        let colorHex = "#";

        for (let i = 0; i < 6; i++)
            colorHex += hexCode[Math.floor(Math.random() * hexCode.length)]

        return colorHex;
    }

    const successNotification = window.createNotification({
        theme: 'success',
        positionClass: 'nfc-center',
        showDuration: 2000
    });

    const warningNotification = window.createNotification({
        theme: 'warning',
        positionClass: 'nfc-center',
        showDuration: 2000
    });
    
    const colorsHex = colorsFromHashParams()

    currentNumberOfColorsInPalette = colorsHex.length > 0 ? colorsHex.length : currentNumberOfColorsInPalette
    currentNumberOfColorsInPalette = currentNumberOfColorsInPalette > maxAllowedNumberOfColorsInPalette 
        ? maxAllowedNumberOfColorsInPalette 
        : currentNumberOfColorsInPalette;
    
    generateColorPalette(colorsHex)
    updateHashParameters();
    
    function generateColorPalette(colorHexArray = []) 
    {
        colorPaletteContainer.innerHTML = "";
        for (let i = 0; i < currentNumberOfColorsInPalette; i++)
        {
            appendColorComponent(colorHexArray[i]);
        }
    }
    
    function appendColorComponent(colorCode = undefined)
    {
        if (colorCode === undefined || colorCode === null)
            colorCode = generateRandomColor()

        const textColor = calculateBrightness(colorCode)
        const component = colorPaletteComponent(colorCode, textColor)
        colorPaletteContainer.appendChild(component)
    }

    function updateHashParameters()
    {
        const colorCodeElements = document.querySelectorAll(".color-code");
        const colors = []
        colorCodeElements.forEach(el => colors.push(el.textContent.substring(1)));
        window.location.hash = `#${colors.join("-")}`
    }
    
    function calculateBrightness(colorHex)
    {
        const colorComponents = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorHex);
        const colorRGB = colorComponents ? {
            r: parseInt(colorComponents[1], 16),
            g: parseInt(colorComponents[2], 16),
            b: parseInt(colorComponents[3], 16)
        } : {r:0, g:0, b:0}

        const brightness = Math.round((
            (colorRGB.r * 299) +
            (colorRGB.g * 587) +
            (colorRGB.b * 114)) / 1000)
        
        return (brightness > 125) ? 'black' : 'white';
    }

    colorPaletteContainer.addEventListener("click", event =>
    {
        console.log(event.target.tagName)

        const element = event.target.tagName.toLowerCase() == "i" 
            ? event.target.parentElement
            : event.target
        
        if (!element.dataset.operation)
            return

        event.stopPropagation()
        event.preventDefault()
    
        switch (element.dataset.operation) {
            case "delete":
                deleteColorEventHandler(event)
                break;
            case "copy":
                copyColorEventHandler(event)
                break;
            case "lock":
                lockColorEventHandler(event)
                break;
                    
            default:
                return;
        }
    })

    const deleteColorEventHandler = (event) =>
    {
        const colorItemElement = event.target.closest(".color-palette-item")
        colorItemElement.remove()
        --currentNumberOfColorsInPalette
        updateHashParameters()
    }

    const copyColorEventHandler = (event) =>
    {
        const colorItemElement = event.target.closest(".color-palette-item")
        const colorHex = colorItemElement.children[1].textContent
        navigator.clipboard.writeText(colorHex).then(
            () => { successNotification({title:"Color copied to clipboard"})},
            () => { warningNotification({title:"Something went wrong!"})})
    }
    
    const lockColorEventHandler = (event) =>
    {
        const lockElement = event.target.children.length > 0 ? event.target.children[0] : event.target
        lockElement.classList.toggle("fa-lock-open")
        lockElement.classList.toggle("fa-lock")
    }
    
    const addColorButton = document.querySelector("#add-color-bth")
    addColorButton.addEventListener("click", (event) =>
    {
        event.stopPropagation()
        event.preventDefault()
        if ( maxAllowedNumberOfColorsInPalette <= currentNumberOfColorsInPalette )
        {
            warningNotification({title:"Oops!", message:"You have reached max colors in palette"})
            return
        }
            
        appendColorComponent()
        updateHashParameters()
        ++currentNumberOfColorsInPalette
    })
    
    const shareColorButton = document.querySelector("#share-color-bth")
    shareColorButton.addEventListener("click", (event) =>
    {
        event.stopPropagation()
        event.preventDefault()
        navigator.clipboard.writeText(window.location.href).then(
            () => { successNotification({title:"Url copied to clipboard"})}, 
            () => { warningNotification({title:"Something went wrong!"})})
    })
    
    const refreshColorsButton = document.querySelector("#refresh-color-bth")
    refreshColorsButton.addEventListener("click", (event) =>
    {
        event.stopPropagation()
        event.preventDefault()

        const lockButtons = document.querySelectorAll(".fa-lock-open")
       
        //modify only not locked colors in palette.
        
        lockButtons.forEach( b => {
                const colorHex = generateRandomColor()
                const textColor = calculateBrightness(colorHex)

                const paletteItem = b.closest(".color-palette-item")
                paletteItem.style.color = textColor
                paletteItem.style.backgroundColor = colorHex
                paletteItem.querySelector(".color-code").textContent = colorHex
            }
        )
        updateHashParameters()
    })
    
    const resetColorButton = document.querySelector("#reset-color-bth")
    resetColorButton.addEventListener("click", (event) =>
    {
        event.preventDefault()
        
        currentNumberOfColorsInPalette = defaultNumberOfColorsInPalette;
        
        generateColorPalette()
        updateHashParameters()
    })
    
})()