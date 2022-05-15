window.addEventListener("load", () => {
    
    //setup canvas
    const canvas = document.getElementById("canvas");
    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    let start_background_color = "white";
    ctx.fillStyle = start_background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const canvas_original = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    //setup button & input
    const red_btn = document.getElementById("red_btn");
    const blue_btn = document.getElementById("blue_btn");
    const green_btn = document.getElementById("green_btn");
    const black_btn = document.getElementById("black_btn");
    
    const color_scope = document.getElementById("color_scope");
    const brush_size = document.getElementById("brush_size");

    const undo = document.getElementById("undo");
    const redo = document.getElementById("redo");
    const reset = document.getElementById("reset");
    const save_image = document.getElementById("save_image");

    const pencil = document.getElementById("pencil");
    const paintBucket = document.getElementById("paintBucket");
    const eraser = document.getElementById("eraser");
    const brushSizeBox = document.getElementById("brushSizeBox");

    

    //variables
    let draw_color = "#000000";
    let drawColorHexToRGB = draw_color.match(/[a-zA-Z0-9]{1,2}/g);
    let drawColorRGBArray = [parseInt(drawColorHexToRGB[0], 16), parseInt(drawColorHexToRGB[1], 16), parseInt(drawColorHexToRGB[2], 16)];
    let colorChosen = "#000000";
    let draw_width = brush_size.value;
    let painting = false;
    let line_appearance = "round";

    let restore_process_array = [canvas_original];
    let index = 0;
    let pixelStack = [];

    let currentTool = pencil;
    let paintBucketImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    brushSizeBox.value = brush_size.value;

    //EventListeners
    canvas.addEventListener('mousedown', startPosition, false);
    canvas.addEventListener('mousemove', draw, false);
    canvas.addEventListener('mouseup', finishedPosition, false);
    canvas.addEventListener('mouseout', finishedPosition, false);
    canvas.addEventListener('touchend', finishedPosition, false);

    
    pencil.addEventListener('click', changeTool);
    paintBucket.addEventListener('click', changeTool);
    eraser.addEventListener('click', changeTool);


    black_btn.addEventListener('click', change_color); 
    red_btn.addEventListener('click', change_color);
    blue_btn.addEventListener('click', change_color);
    green_btn.addEventListener('click', change_color);
    color_scope.addEventListener('input', change_color_scope);

    brush_size.addEventListener('input', change_brush_size);
    brushSizeBox.addEventListener('input', changebrushSizeByBox);

    reset.addEventListener('click', reset_canvas);
    undo.addEventListener('click', undo_last);
    redo.addEventListener('click', redo_next);
    save_image.addEventListener('click', save_image_fcn);


    //drawing process
    function startPosition(event){
        painting = true;
        if(currentTool === pencil) {
            ctx.beginPath();
            ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
            event.preventDefault();
        }
        else if(currentTool === paintBucket) {
            fillColorFunction(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop)
            painting = false;
            restore_process_array.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            index++;
            cursorChangeToPointer(undo);
            undo.disabled = false;
            event.preventDefault();
        }
        else if(currentTool === eraser) {
            ctx.beginPath();
            ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
            event.preventDefault();
        }

        
    }

    function draw(event){
        if(painting) {
            ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
            ctx.strokeStyle = draw_color;
            ctx.lineWidth = draw_width;
            ctx.lineCap = line_appearance;
            ctx.lineJoin = "round";       
            ctx.stroke();
        }

    }

    function finishedPosition(event){
        if(painting) {
            ctx.stroke();
            ctx.closePath();
            
            if( index != restore_process_array.length-1 ) {
                restore_process_array.splice(index+1, restore_process_array.length-1);
                redo.disabled = true;
                cursorChangeToNoDrop(redo);
            }
            
            restore_process_array.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            index++;
            cursorChangeToPointer(undo);
            undo.disabled = false;
            painting = false;
        }
        event.preventDefault();
    }





    //change color
    function change_color(color) {
        if(currentTool === eraser) {
            colorChosen = color.target.style.background;
            drawColorRgbStr2RGB = draw_color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            drawColorRGBArray = [parseInt(drawColorRgbStr2RGB[1], 10), parseInt(drawColorRgbStr2RGB[2], 10), parseInt(drawColorRgbStr2RGB[3], 10)];
        }
        else{
            draw_color = color.target.style.background;
            colorChosen = color.target.style.background;
            drawColorRgbStr2RGB = draw_color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            drawColorRGBArray = [parseInt(drawColorRgbStr2RGB[1], 10), parseInt(drawColorRgbStr2RGB[2], 10), parseInt(drawColorRgbStr2RGB[3], 10)];
        }
        black_btn.classList.remove("selectedColorBtn");
        red_btn.classList.remove("selectedColorBtn");
        blue_btn.classList.remove("selectedColorBtn");
        green_btn.classList.remove("selectedColorBtn");
        color_scope.classList.remove("selectedColorScope");
        color.target.classList.add("selectedColorBtn");
    }

    function change_color_scope(color) {
        if(currentTool === eraser) {
            colorChosen = color.target.value;
            drawColorHexToRGB = draw_color.match(/[a-zA-Z0-9]{1,2}/g);
            drawColorRGBArray = [drawColorHexToRGB[0], drawColorHexToRGB[1], drawColorHexToRGB[2]];
        }
        else {
            draw_color = color.target.value;
            colorChosen = color.target.value;
            drawColorHexToRGB = draw_color.match(/[a-zA-Z0-9]{1,2}/g);
            drawColorRGBArray = [drawColorHexToRGB[0], drawColorHexToRGB[1], drawColorHexToRGB[2]];
        }
        black_btn.classList.remove("selectedColorBtn");
        red_btn.classList.remove("selectedColorBtn");
        blue_btn.classList.remove("selectedColorBtn");
        green_btn.classList.remove("selectedColorBtn");
        color.target.classList.add("selectedColorScope");
    }

    //change brush size
    function change_brush_size(size) {
        draw_width = size.target.value;
        brushSizeBox.value = size.target.value;
    }

    function changebrushSizeByBox(event) {
        if(event.target.value > 100) {
            event.target.value = 100;
            draw_width = event.target.value;
            brush_size.value = event.target.value;
        }
        else {
            draw_width = event.target.value;
            brush_size.value = event.target.value;
        }
    }



    //reset canvas
    function reset_canvas(){
        ctx.fillStyle = start_background_color;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        // Canvas original settings
        restore_process_array = [canvas_original];
        index = 0;

        undo.disabled = true;
        redo.disabled = true;
        cursorChangeToNoDrop(undo);
        cursorChangeToNoDrop(redo);

        draw_color = "#000000";
        brush_size.value = "6";
        draw_width = brush_size.value;
        brushSizeBox.value = brush_size.value;

        colorChosen = "#000000";
        color_scope.value = "#000000";
        drawColorHexToRGB = draw_color.match(/[a-zA-Z0-9]{1,2}/g);
        drawColorRGBArray = [parseInt(drawColorHexToRGB[0], 16), parseInt(drawColorHexToRGB[1], 16), parseInt(drawColorHexToRGB[2], 16)];

        currentTool.classList.remove("selected");
        currentTool = pencil;
        currentTool.classList.add("selected");

        black_btn.classList.add("selectedColorBtn");
        red_btn.classList.remove("selectedColorBtn");
        blue_btn.classList.remove("selectedColorBtn");
        green_btn.classList.remove("selectedColorBtn");
        color_scope.classList.remove("selectedColorScope");
    }

    //undo & redo
    function undo_last() {
            index--;
            ctx.putImageData(restore_process_array[index], 0, 0);
            if( index === 0 ) {
                undo.disabled = true;
                cursorChangeToNoDrop(undo);
            }
            redo.disabled = false;
            cursorChangeToPointer(redo);      
    }

    function redo_next() {
        index++;
        ctx.putImageData(restore_process_array[index], 0, 0);    
        if( index === restore_process_array.length-1) {
            redo.disabled = true;
            cursorChangeToNoDrop(redo);
        }
        undo.disabled = false;
        cursorChangeToPointer(undo);
    }

    function save_image_fcn() {
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute('download', 'CanvasAsImage.png');
            canvas.toBlob(function(blob) {
              let url = URL.createObjectURL(blob);
              downloadLink.setAttribute('href', url);
              downloadLink.click();
            });
    }


    // paint bucket
    function matchStartColor(pixelPosition){
        let pixelRedVariable = paintBucketImageData.data[pixelPosition];
        let pixelGreenVariable = paintBucketImageData.data[pixelPosition+1];
        let pixelBlueVariable = paintBucketImageData.data[pixelPosition+2];

        return (pixelRedVariable === startRed && pixelGreenVariable === startGreen && pixelBlueVariable === startBlue);
    }

    function colorPixel(pixelPosition){
        paintBucketImageData.data[pixelPosition] = drawColorRGBArray[0];
        paintBucketImageData.data[pixelPosition+1] = drawColorRGBArray[1];
        paintBucketImageData.data[pixelPosition+2] = drawColorRGBArray[2];
        paintBucketImageData.data[pixelPosition+3] = 255;
    }

    

    function fillColorFunction(startx, starty) {
        
        pixelStack = [[startx, starty]];
        
        paintBucketImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        startPositionInArray = (starty*canvas.width + startx) * 4;
        startRed = paintBucketImageData.data[startPositionInArray];
        startGreen = paintBucketImageData.data[startPositionInArray+1];
        startBlue = paintBucketImageData.data[startPositionInArray+2];

        //While stack length === true, pop the stack and color it 
        while (pixelStack.length){
            pixelStackPop = pixelStack.pop();
            pixelXAxis = pixelStackPop[0];
            pixelYAxis = pixelStackPop[1];

            pixelPosition = (pixelYAxis*canvas.width + pixelXAxis) * 4;

            //Find the boundary of y-axis
            while (pixelYAxis-- >= 0 && matchStartColor(pixelPosition)){
                pixelPosition = pixelPosition - canvas.width*4;
            }

            pixelPosition += canvas.width * 4;
            ++pixelYAxis;


            reachLeft = false;
            reachRight = false;
            while(pixelYAxis++ < canvas.height-1 && matchStartColor(pixelPosition)){
                
                colorPixel(pixelPosition);
                ctx.putImageData(paintBucketImageData, 0, 0);

                if(pixelXAxis > 0){
                    if(matchStartColor(pixelPosition - 4)){
                        if(!reachLeft){
                            pixelStack.push([pixelXAxis - 1, pixelYAxis]);
                            reachLeft = true;
                        }
                    }
                    else{ 
                        if(reachLeft){
                            reachLeft = false;
                        }
                    }
                }

                if(pixelXAxis < canvas.width-1){
                    if(matchStartColor(pixelPosition + 4)) {
                        if(!reachRight){
                        pixelStack.push([pixelXAxis + 1, pixelYAxis]);
                        reachRight = true;
                        }
                    }
                    else {
                        if(reachRight){
                            reachRight = false;
                        }
                    }
                }
                pixelPosition += canvas.width * 4;
            }
        }
    }


    //change tool
    function changeTool(toolClicked){
        currentTool.classList.remove("selected");
        // Highlight the last selected tool on toolbar
        toolClicked.currentTarget.classList.add("selected");
        // Change chosen color
        if(toolClicked.currentTarget === eraser) {
            draw_color = "#FFFFFF";
        }
        else {
            draw_color = colorChosen;
        }
        // Change current tool used for drawing
        currentTool = toolClicked.currentTarget;
    }


    //change cursor
    function cursorChangeToNoDrop(button) {
        button.style.cursor = "no-drop";
    }

    function cursorChangeToPointer(button) {
        button.style.cursor = "pointer";
    }


} );