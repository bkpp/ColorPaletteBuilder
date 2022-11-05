
(function () {
    
    let currentNumberOfColorsInPalette = 5
    const defaultNumberOfColorsInPalette = 5
    const maxAllowedNumberOfColorsInPalette = 10
    
    const colorPaletteContainer = document.querySelector(".color-palette-container")
    
    const colorsFromHashParams = () => {
        const params = window.location.hash.substring(1);
        return params.length > 0 ? params.split("-").map(c => `#${c}`): []
    }
    
    const colorPaletteItemComponent = (colorHex, textColor = "#000000") =>
    {
        const componentHtml = 
            `<div class="color-palette-item" style="background-color:${colorHex};color:${textColor};">
                <div class="color-palette-item-operations">
                    <div class="delete-button">
                        <i class="fa-regular fa-trash-can"></i>
                    </div>
                    <div class="copy-button">
                        <i class="fa-regular fa-paste"></i>
                    </div>
                </div>
                
                <div class="color-code">${colorHex}</div>

                <div class="color-palette-item-operations">
                    <div class="lock-button">
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
    
    generateColorElements(colorsHex)
    updateHashParameters();
    
    function generateColorElements(colorHexArray = []) 
    {
        colorPaletteContainer.innerHTML = "";
        for (let i = 0; i < currentNumberOfColorsInPalette; i++)
        {
            addNewColorElement(colorHexArray[i]);
        }
    }
    
    function addNewColorElement(colorCode = undefined)
    {
        if (colorCode === undefined || colorCode === null)
            colorCode = generateRandomColor()

        const textColor = calculateBrightness(colorCode)
        const component = colorPaletteItemComponent(colorCode, textColor)
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

    registerAllColorOperationEvents()
    
    function registerDeleteColorEvents()
    {
        const deleteButtons = document.querySelectorAll(".delete-button")
        
        deleteButtons.forEach(b => {
            b.removeEventListener('click', deleteColorEventHandler)
            b.addEventListener('click', deleteColorEventHandler)
        })
    }
    
    function deleteColorEventHandler(event)
    {
        event.stopPropagation()
        event.preventDefault()

        const colorItemElement = event.target.closest(".color-palette-item")
        colorItemElement.remove()
        --currentNumberOfColorsInPalette
        updateHashParameters()
    }

    function registerCopyColorEvents()
    {
        const copyButtons = document.querySelectorAll(".copy-button, .color-code")
        
        copyButtons.forEach(b => {
            b.removeEventListener('click', copyColorEventHandler)
            b.addEventListener('click', copyColorEventHandler)
        })
    }

    function registerAllColorOperationEvents()
    {
        registerDeleteColorEvents()
        registerCopyColorEvents()
        registerLockColorEvent()
    }
    
    function copyColorEventHandler(event)
    {
        event.stopPropagation()
        event.preventDefault()

        const colorItemElement = event.target.closest(".color-palette-item")
        const colorHex = colorItemElement.children[1].textContent
        navigator.clipboard.writeText(colorHex).then(
            () => { successNotification({title:"Color copied to clipboard"})},
            () => { warningNotification({title:"Something went wrong!"})})
    }
    
    function registerLockColorEvent()
    {
        const lockButtons = document.querySelectorAll(".lock-button")
        
        lockButtons.forEach(b => {
            b.removeEventListener('click', lockColorEventHandler)
            b.addEventListener('click', lockColorEventHandler)
        })
    }
    
    function lockColorEventHandler(event)
    {
        event.stopPropagation()
        event.preventDefault()
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
            
        addNewColorElement()
        updateHashParameters()
        ++currentNumberOfColorsInPalette
        registerAllColorOperationEvents()
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
        registerAllColorOperationEvents()
    })
    
    const resetColorButton = document.querySelector("#reset-color-bth")
    resetColorButton.addEventListener("click", (event) =>
    {
        event.stopPropagation()
        event.preventDefault()
        
        currentNumberOfColorsInPalette = defaultNumberOfColorsInPalette;
        
        generateColorElements()
        updateHashParameters()
        registerAllColorOperationEvents()
    })
})()