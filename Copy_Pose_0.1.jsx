/// UI SETUP FUNCTION ///
{
    function initUI(thisObj) {
        function buildUI(thisObj) {
            var window = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Copy Pose", undefined, {resizeable: true, closeButton: true });
            window.margins = 20;
        
        //GROUPS
        var maingroup = window.add('panel')
        var maingroup2 = window.add('panel')
        var maingroup3 = window.add('panel')

        var poseGroup = maingroup.add('group')
        poseGroup.orientation = 'column';

        var poseGroupTitle = poseGroup.add('statictext', undefined, 'Copy Pose')
        poseGroupTitle.alignment = ['left', 'top']
        poseGroupTitle.preferredSize = [150,20]


        var otherGroup = maingroup3.add('group')
        otherGroup.orientation = 'column'

        var markerGroup = maingroup2.add('group')
        markerGroup.orientation = "column"
        var markerCheckbox = markerGroup.add('checkbox', undefined, 'Add Marker')
        markerCheckbox.alignment = ['left', 'top']

        // ADD BUTTON
        var addButton = poseGroup.add('button', undefined, 'New Pose')
        addButton.preferredSize = [70,30] 
        addButton.onClick = function() {
            handleOnClick()
        }




        //INPUT FIELD UI

        var poseGroupTime = poseGroup.add('group')
        poseGroupTime.orientation = 'row';
        poseGroupTime.preferredSize = [200,200]

        var timeCheckbox = poseGroupTime.add('checkbox')
        timeCheckbox.preferredSize = [14,20] 

        timeCheckbox.addEventListener('mousedown', function(e) {
            if (timeCheckbox.value) {
                addButton.text = 'New Pose'
            }
            else addButton.text = 'Copy Pose'
        } )

        var timeText = poseGroupTime.add('statictext', undefined, 'Time (in s):')

        var timeInput = poseGroupTime.add('edittext')
        timeInput.characters = 2;
        timeInput.text = 0
        timeInput.active = true;
        timeInput.onChange = function () {
            if ( isNaN( parseInt(timeInput.text) ) ) {
                alert( 'Time value must be a number' )
                timeInput.text = parseInt(0)
                return null
            }
            timeInput.onClick= function () {
                timeInput.text = ""
            }
        }
        

        var markerTextInfo = markerGroup.add('statictext', undefined, 'Marker Name:')
        markerTextInfo.alignment = ['left', 'top']
        var markerText = markerGroup.add('edittext', undefined)
        markerText.text = '..'
        
        markerText.characters = 20;
        markerText.active = false;
        // markerText.text = "Marker name..."
        markerText.justify = 'center'
        
        var markerDurationInfo = markerGroup.add('statictext', undefined, 'Marker Duration:')
        markerDurationInfo.alignment = ['left', 'top']
        var markerDuration = markerGroup.add('edittext', undefined)
        markerDuration.text = 0
        
        markerDuration.characters = 20
        // markerDuration.text = 'Marker duration(in s)'
        markerDuration.justify = 'center'

        var otherGroupTitle = otherGroup.add('statictext', undefined, 'Other Options')
        otherGroupTitle.alignment = ['left', 'top']
        otherGroupTitle.preferredSize = [150,20]
        otherGroup.location = [100,200] 

        var holdCheckbox = otherGroup.add('checkbox', undefined, 'Disable Toggle Hold Last Key')
        var updateMarkers = otherGroup.add('button', undefined, 'Update source markers')
        updateMarkers.alignment = ['left', 'top']

        updateMarkers.onClick = function() {
            marker.copyToComp()
        }



        function updateUIText(window) {
            for (var i = 0; i < window.children.length; i++) {
                if (window.children[i].type == 'edittext') {
                    if (window.children[i] == window.children['markerText'] && !window.children[i].text  ) {
                        window.children[i].text = 'Marker name...'

                    }
                    if (window.children[i] == window.children['markerDuration'] && !window.children[i].text ) {
                        window.children[i].text = 'Marker duration(in s)'
                    }
                }
            }
        }

        function handleOnClick() {
            var comp = app.project.activeItem;
            var keyTime;

            if ( timeCheckbox.value ) {
                keyTime = parseInt(timeInput.text)
            }
            else {
                keyTime = app.project.activeItem.duration
            }

            keyframes.temp['values'] = []
            keyframes.temp['times'] = []

            if ( keyTime < 0 ) {
                alert("Time value can't be less than 0")
                return null
            }

            if ( keyTime === "undefined" ) {
                alert('You need to enter Time Value')
                return null
            }

            if ( typeof keyTime != 'number' ) {
                alert('Time Value must be a number')
            }

            if ( !comp.selectedLayers.length ) {
                alert('Please select at least one layer')
                return null
            }
            
            app.beginUndoGroup('New Pose')

            keyframes.applyFnSelected( // Run main function
                keyTime,
                comp.time,
                keyframes.copyFound,
                holdCheckbox.value )

            if ( markerCheckbox.value ) { // If marker checkbox selected handle marker layer
                    layer.handleOnClick( comp.time, markerText.text, markerDuration.text )
                }

            app.beginUndoGroup()
        }

        window.layout.layout(true);

        return window
        }
        var builtUi = buildUI(thisObj)

        if (builtUi != null && builtUi instanceof Window) {
            builtUi.center();
            builtUi.show()
        } 
    }
    initUI(this)
}
        

var keyframes = {
    temp: {
        'values': [],
        'times': []
    },
    setInterpolation: function setInterpolation( prop, keyNum ) {
        // $.writeln('got to the function')
        if (prop.keyOutInterpolationType( keyNum ) === 6612 ) {
            prop.setInterpolationTypeAtKey( keyNum, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.HOLD )
            
            return true
        }
        if (prop.keyOutInterpolationType( keyNum ) === 6613 ) {
            prop.setInterpolationTypeAtKey( keyNum, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.HOLD )
            return true
        }
        if (prop.keyOutInterpolationType( keyNum ) === 6614 ) {
            prop.setInterpolationTypeAtKey( keyNum, KeyframeInterpolationType.HOLD )
            return true
        }
        return null
    },
    copyFound: function copyFound(keyTime,layer,time, isIntBox) {
        // filter through all properties using recursion     
        if (layer.numProperties > 0 ) {
        // if prop passed has own properties -> loop every prop
            for (var i = 1; i <= layer.numProperties; i++) {
                var prop = layer.property(i)
            if (prop.numKeys > 0 && prop.name != "Marker" ) { // don't copy marker keysHOLD
                if ( keyTime === app.project.activeItem.duration && prop.name == "Checkbox") {
                    // $.writeln(prop.parentProperty.name)
                    // $.writeln('found Checkbox cntrl')
                    return null
                    
                }

                if ( prop.keyOutInterpolationType(prop.numKeys) == 6614 || prop.keyInInterpolationType(prop.numKeys) == 6614 ) {
                    // $.writeln('caught hold:', prop.parentProperty.name )
                    return null
                }

                if (prop.isSeparationFollower) {
                    return null
                }
                if( prop.dimensionsSeparated ) {
                    for (var x=0; x < 2; x++) {
                        if (prop.getSeparationFollower(x).numKeys > 0) {
                                this.populateTempArr(
                                    prop.getSeparationFollower(x),
                                    keyTime,
                                    time,
                                    isIntBox
                                )
                            }
                        
                    }
                }
                else {
                    this.populateTempArr(prop, keyTime, time, isIntBox)
                }
                }
                // go through previous step w/ new prop from the loop
                this.copyFound(
                    keyTime,
                    prop,
                    time,
                    isIntBox);
            }  
            }
    },
    populateTempArr: function populateTempArr(prop, keyTime, time, isIntBox) {
        var tempArr = []
                for (var o = 1; o <= prop.numKeys; o++) {
                    if ( prop.keyTime(o) < time ) {
                        tempArr.push( prop.keyValue(o) )
                    }
                }
                var foundKeyIndex;
                if ( prop.keyTime( prop.nearestKeyIndex(keyTime)) > keyTime && (prop.nearestKeyIndex(keyTime) - 1) >= 1 ) {
                    foundKeyIndex = Number(prop.nearestKeyIndex(keyTime)) - 1
                }
                else {
                    foundKeyIndex = prop.nearestKeyIndex(keyTime)
                }

                this.temp['values'].push(prop.keyValue(tempArr.length), prop.keyValue( foundKeyIndex ))
                this.temp['times'].push(time- 1/(app.project.activeItem.frameRate) , time)

                    if ( prop.isInterpolationTypeValid(KeyframeInterpolationType.HOLD) && !isIntBox ) {
                        this.setInterpolation( prop, tempArr.length )
                    }
                prop.setValuesAtTimes(this.temp['times'], this.temp['values'] )

                if ( prop.isInterpolationTypeValid(KeyframeInterpolationType.LINEAR) ) {
                    prop.setInterpolationTypeAtKey( tempArr.length + 2, KeyframeInterpolationType.LINEAR )
                }

                this.temp['values'] = []
                this.temp['times'] = []
    },
    applyFnSelected: function applyFnSelected(keyTime, time,fn, isIntBox) {
        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers
            for ( var i = 0; i < selectedLayers.length; i++ ) {
                fn.call( this, keyTime, selectedLayers[i], time, isIntBox )
                comp.time = time
            }
            alert( 'Created New Pose At: ' + time + ' s' )
    }

}

var layer = {
    addLayer: function addLayer( layerName ) {
        var comp = app.project.activeItem;

        comp.layers.addSolid([255, 255, 255], layerName, comp.width, comp.height, comp.pixelAspect, comp.duration);
        comp.layers[1].adjustmentLayer = true;
        comp.layers[1].guideLayer = true;
        comp.layers[1].locked = true;
    },
    handleOnClick: function handleOnClick(time, markerValue, markerDuration) {
        var comp = app.project.activeItem;

        var layerName = '__POSE__'
        if ( !comp.layers.byName(layerName) ) {
            this.addLayer( layerName )
        }
        marker.addMarker( time, markerValue, markerDuration, layerName )
    }
}

var marker = {
    addMarker: function addMarker( time, markerValue, markerDuration, layerName ) {
        var comp = app.project.activeItem;
        var layer = comp.layers.byName(layerName)

        var newMarker = new MarkerValue(markerValue.toUpperCase()) // Set up a marker
        newMarker.duration = markerDuration
        newMarker.label = 3 
        layer.property("Marker").setValueAtTime(time, newMarker)

        var thisMarker = layer.property("Marker").valueAtTime(time, true) // Get marker
    },
    addCompMarker: function addMarker( time, markerValue, markerDuration) {
        var comp = app.project.activeItem;

        

        var newMarker = new MarkerValue(markerValue.toUpperCase()) // Set up a marker
        newMarker.duration = markerDuration
        newMarker.label = 3 
        comp.markerProperty.setValueAtTime(time, newMarker)

        // var thisMarker = comp.property("Marker").valueAtTime(time, true) // Get marker
        // $.writeln( thisMarker.duration() )
    },
    copyToComp: function copyToComp() {  
        if ( !app.project.activeItem.selectedLayers[0]  ) {
            alert('You need to select a composition first!')
            return
        }

        var comp = app.project.activeItem;

        comp.time = 0

        var myComp;
        for (var i = 1; i <= app.project.numItems; i ++) {
            if ((app.project.item(i) instanceof CompItem) && (app.project.item(i).name === comp.selectedLayers[0].name )) {
                myComp = app.project.item(i);
                break;
            }
        }

        if (!myComp) {
            alert ('You need to select a valid composition')
        }

        if ( !myComp.layers.byName('__POSE__') ) {
            alert('No keyframes to copy inside')
        }

        var poseLayer = myComp.layers.byName('__POSE__').property("Marker")

        var tempArr = {
            'val': [],
            'time': []
        }

        for ( var p = comp.selectedLayers[0].property("Marker").numKeys; p > 0 ; p-- ) {
            comp.selectedLayers[0].property("Marker").removeKey(p)
        }

        for ( var i = 1; i <= poseLayer.numKeys; i++ ) {
            tempArr['time'].push( poseLayer.keyTime(i) )
            tempArr['val'].push( poseLayer.keyValue(i) )
        }

        for ( var o = 0; o < poseLayer.numKeys; o++ ) {
            comp.selectedLayers[0].property("Marker").setValueAtTime( tempArr['time'][o] + comp.selectedLayers[0].startTime, tempArr['val'][o])
        }

        tempArr = {}    

        

        
        
        // app.executeCommand(app.findMenuCommandId("Add Marker"));
    }
}