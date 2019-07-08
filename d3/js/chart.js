
$(function() {
        var $document = $(document);
        var selector = '[data-rangeslider]';
        var $element = $(selector);
        // For ie8 support
        var textContent = ('textContent' in document) ? 'textContent' : 'innerText';
        // Example functionality to demonstrate a value feedback
        function valueOutput(element) {
            var value = element.value;
            var output = element.parentNode.getElementsByTagName('output')[0] || element.parentNode.parentNode.getElementsByTagName('output')[0];
            output[textContent] = value;
        }
        $document.on('input', 'input[type="range"], ' + selector, function(e) {
            valueOutput(e.target);
        });
        // Example functionality to demonstrate disabled functionality
        $document .on('click', '#js-example-disabled button[data-behaviour="toggle"]', function(e) {
            var $inputRange = $(selector, e.target.parentNode);
            if ($inputRange[0].disabled) {
                $inputRange.prop("disabled", false);
            }
            else {
                $inputRange.prop("disabled", true);
            }
            $inputRange.rangeslider('update');
        });
        // Example functionality to demonstrate programmatic value changes
        $document.on('click', '#js-example-change-value button', function(e) {
            var $inputRange = $(selector, e.target.parentNode);
            var value = $('input[type="number"]', e.target.parentNode)[0].value;
            $inputRange.val(value).change();
        });
        // Example functionality to demonstrate programmatic attribute changes
        $document.on('click', '#js-example-change-attributes button', function(e) {
            var $inputRange = $(selector, e.target.parentNode);
            var attributes = {
                    min: $('input[name="min"]', e.target.parentNode)[0].value,
                    max: $('input[name="max"]', e.target.parentNode)[0].value,
                    step: $('input[name="step"]', e.target.parentNode)[0].value
                };
            $inputRange.attr(attributes);
            $inputRange.rangeslider('update', true);
        });
        // Example functionality to demonstrate destroy functionality
        $document
            .on('click', '#js-example-destroy button[data-behaviour="destroy"]', function(e) {
                $(selector, e.target.parentNode).rangeslider('destroy');
            })
            .on('click', '#js-example-destroy button[data-behaviour="initialize"]', function(e) {
                $(selector, e.target.parentNode).rangeslider({ polyfill: false });
            });
        // Example functionality to test initialisation on hidden elements
        $document
            .on('click', '#js-example-hidden button[data-behaviour="toggle"]', function(e) {
                var $container = $(e.target.previousElementSibling);
                $container.toggle();
            });
        // Basic rangeslider initialization
        $element.rangeslider({
            // Deactivate the feature detection
            polyfill: false,
            // Callback function
            onInit: function() {
                valueOutput(this.$element[0]);
            },
            // Callback function
            onSlide: function(position, value) {
                console.log('onSlide');
                console.log('position: ' + position, 'value: ' + value);
            },
            // Callback function
            onSlideEnd: function(position, value) {
                console.log('onSlideEnd');
                console.log('position: ' + position, 'value: ' + value);
            }
        });
    });