<!DOCTYPE html>
<html lang="ru">
    <head>
        <meta charset="utf-8">
        <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
        <script src="src/jquery.sprite_animation.js"></script>
        <style>
            #animation {
                width: 150px;
                position: relative;
                margin: 60px auto;
            }
            #animation .spriteActive button {
                float: left;
            }
            #animation .spriteContainer {
                margin-left: 44px;
            }
        </style>
    </head>
<body>
    <div id="animation"><div>
    <script>
        $('#animation').spriteAnimation({
            src        : 'http://zlob.in/wp-content/uploads/2014/01/sprite.jpg',
            width      : 66,
            height     : 135,
            frameCount : 7,
            fps        : 17
        });
        $('#animation').spriteAnimation('play');
    </script>
</body>
</html>
