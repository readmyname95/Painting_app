window.addEventListener("load", () => {
    
    
    //setup canvas
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = 500;

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
    const eraser = document.getElementById("eraser");
    const color_scope = document.getElementById("color_scope");
    const brush_size = document.getElementById("brush_size");
    const reset = document.getElementById("reset");
    const undo = document.getElementById("undo");
    const redo = document.getElementById("redo");
    const save_image = document.getElementById("save_image")

    //variables
    let draw_color = "black";
    let draw_width ="2";
    let painting = false;
    let line_appearance = "round";

    let restore_process_array = [canvas_original];
    let index = 0;

    //EventListeners

    canvas.addEventListener('touchstart', startPosition, false);
    canvas.addEventListener('touchmove', draw, false);
    canvas.addEventListener('mousedown', startPosition, false);
    canvas.addEventListener('mousemove', draw, false);
    canvas.addEventListener('mouseup', finishedPosition, false);
    canvas.addEventListener('mouseout', finishedPosition, false);
    canvas.addEventListener('touchend', finishedPosition, false);

    red_btn.addEventListener('click', change_color);
    blue_btn.addEventListener('click', change_color);
    green_btn.addEventListener('click', change_color);
    black_btn.addEventListener('click', change_color);
    eraser.addEventListener('click', change_color);
    color_scope.addEventListener('input', change_color_scope);

    brush_size.addEventListener('input', change_brush_size);

    reset.addEventListener('click', reset_canvas);
    undo.addEventListener('click', undo_last);
    redo.addEventListener('click', redo_next);
    save_image.addEventListener('click', save_image_fcn);

    //drawing process
    function startPosition(event){
        painting = true;
        ctx.beginPath();
        ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        event.preventDefault();
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
            painting = false;
        }
        event.preventDefault();

        if( event.type != 'mouseout') {
            if( index != restore_process_array.length-1 ) {
                restore_process_array.splice(index+1, restore_process_array.length-1);
                redo.disabled = true;
            }
            restore_process_array.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            index ++;
            undo.disabled =  false;
        }
    }


    //change color
    function change_color(color) {
        if(color.target == eraser) {
            draw_color = color.target.style.background
            line_appearance = "round";
        }
        else{
        draw_color = color.target.style.background
        line_appearance = "round";
        }
    }

    function change_color_scope(color) {
        draw_color = color.target.value;
    }

    //change brush size
    function change_brush_size(size) {
        draw_width = size.target.value;
    }

    //reset canvas
    function reset_canvas(){
        ctx.fillStyle = start_background_color;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        restore_process_array = [canvas_original];
        index = 0;
        undo.disabled = true;
        redo.disabled = true;
    }

    //undo & redo
    function undo_last() {
            index--;
            ctx.putImageData(restore_process_array[index], 0, 0);
            if( index === 0 ) {
                undo.disabled = true;
            }
            redo.disabled = false;      
    }

    function redo_next() {
        index++;
        ctx.putImageData(restore_process_array[index], 0, 0);    
        if( index === restore_process_array.length-1) {
            redo.disabled = true;
        }
        undo.disabled = false;
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

} );
