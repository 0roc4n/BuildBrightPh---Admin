import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { GoogleMapPinsService } from 'src/app/services/google-map-pins.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [GoogleMapsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent  implements OnInit, AfterViewInit, OnChanges{
  @ViewChild('mapRef')               mapRef!               : GoogleMap;
  @ViewChild('riderMarkerRef')       riderMarkerRef!       : MapMarker
  @ViewChild('storeMarkerRef')       storeMarkerRef!       : MapMarker
  @ViewChild('destinationMarkerRef') destinationMarkerRef! : MapMarker



  @Input() clientAddressPosition!: google.maps.LatLngLiteral
  @Input() riderPosition? : google.maps.LatLngLiteral
  @Input() storePosition? : google.maps.LatLngLiteral
  @Input() height?:string
  @Input() draggable?:boolean
  @Input() zoom?:number
  mapOptions!: google.maps.MapOptions

  constructor( public googleMapPins: GoogleMapPinsService ) { }

  ngOnInit() {
    this.height    = this.height    ?? "300px"
    this.draggable = this.draggable === false ? false : true
    this.zoom      = this.zoom      ??  13

    this.mapOptions = {
      disableDefaultUI: true,
      clickableIcons: false,
      keyboardShortcuts: false,
      draggable: this.draggable
    }
  }


  ngAfterViewInit(): void {
    this.destinationMarkerRef.marker?.setPosition(this.clientAddressPosition)
    this.storeMarkerRef.marker?.setPosition(this.storePosition)
    this.riderMarkerRef.marker?.setPosition(this.riderPosition)

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(this.clientAddressPosition)
    if (this.riderPosition)   bounds.extend(this.riderPosition)
    if (this.storePosition)   bounds.extend(this.storePosition)
    this.mapRef.fitBounds(bounds)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.riderMarkerRef?.marker?.setPosition(this.riderPosition)
  }

}
