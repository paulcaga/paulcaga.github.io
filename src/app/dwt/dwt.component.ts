import { Component, OnInit } from '@angular/core';
import Dynamsoft from 'dwt';
import { DeviceInfo } from 'dwt/dist/types/Addon.Camera';
import { WebTwain } from 'dwt/dist/types/WebTwain';

@Component({
  selector: 'app-dwt',
  templateUrl: './dwt.component.html',
  styleUrls: ['./dwt.component.scss'],
})
export class DwtComponent implements OnInit {
  DWObject: WebTwain | null = null;
  videoPlaying: boolean = false;
  currentCamera: string = '';
  currentDevice: string = '';
  containerId = 'dwtcontrolContainer';
  devices: DeviceInfo[] = [];
  cameras: DeviceInfo[] = [];
  constructor() {}

  ngOnInit(): void {
    // Dynamsoft.DWT.Containers = [
    //   {
    //     WebTwainId: 'dwtObject',
    //     ContainerId: this.containerId,
    //     Width: '300px',
    //     Height: '400px',
    //   },
    // ];
    //custom dynamsoft object
    // var DWObject = null
    var self = this;
    Dynamsoft.DWT.CreateDWTObjectEx(
      {
        WebTwainId: 'dwtcontrol',
      },
      function (obj: WebTwain) {
        self.DWObject = obj;
        const container = document.getElementById(
          'dwtcontrolContainer'
        ) as HTMLDivElement;
        self.DWObject.Viewer.bind(container);
        self.DWObject.Viewer.height = 600;
        self.DWObject.Viewer.width = 800;
        var thumbnailViewer = self.DWObject.Viewer.createThumbnailViewer();
        thumbnailViewer.hoverBorder = '100px black solid';
        thumbnailViewer.show();
        self.DWObject.Viewer.show();
      },
      function (err) {
        console.log(err);
      }
    );

    Dynamsoft.DWT.UseLocalService = true;
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      console.log('event fired');
      this.Dynamsoft_OnReady();
    });
    // Dynamsoft.DWT.ProductKey =
    //   'f0068NQAAAIVnflrhWhvruidar5rcUrTvmjXKZZ0m6C4+rLu5EgpRITb4/Wvb1fipveNnB0//2ShuYLTLieQ4BtL1dPlo6FA';
    Dynamsoft.DWT.ProductKey =
      't0154KQMAAEQbBf/4T2H0zI09dZkFR+iwVy80Ygqb4Z5hd1NDDYwOWAQ0Rf0kjre/W80e6J121tQhlFlfz4khjuW9wORJcOs3EvuGqBgkF3GPZN1cGGbzdaOHwUOcy/hdT+aHfNCIUxgOGO0br0/bVHM+a8h6zqXhgNG+qeZcmHqdY7B33BT7Xv5IDcMBo31z5Hw3GiCaNP0BSE+iwQ==';
    Dynamsoft.DWT.ResourcesPath = 'assets/dwt-resources';
    Dynamsoft.DWT.Load();
  }

  async initCameras() {
    if (!this.DWObject) {
      return;
    }



    const devices = this.DWObject?.GetSourceNames() as string[];
    const deviceSelect = document.getElementById(
      'cameraSelect'
    ) as HTMLSelectElement;
      console.log(deviceSelect.length);
    if (deviceSelect.options.length > 1) {
      for (let i = deviceSelect.options.length; i > 0; i--) {
        deviceSelect.options.remove(i)
      } 
    }
    for (let i = 0; i < devices.length; i++) {
      this.devices.push({
        deviceId: i.toString(),
        label: devices[i],
      });
      deviceSelect.options.add(
        new Option(<string>this.devices[i].label, this.devices[i].deviceId)
      );
    }
    // if(bDirectShow)
    // let c = this.DWObject.Addon.Webcam.GetSourceList();
    // else
    // let self = this
    // this.cameras = await this.DWObject.Addon.Camera.getSourceList().then((cameras: DeviceInfo[]) => cameras
    // )
    // console.log(this.cameras);
    // const cameraSelect = document.getElementById(
    //   'cameraSelect'
    // ) as HTMLSelectElement;
    // for (let i = 0; i < this.cameras.length; i++) {
    //   cameraSelect.options.add(
    //     new Option(<string>this.cameras[i].label, this.cameras[i].deviceId)
    //   );
    //   console.log(cameraSelect.options);
    // }
    this.DWObject?.Viewer.setViewMode(-1, -1);
    this.DWObject!.FitWindowType = -1;
  }

  Dynamsoft_OnReady() {
    this.DWObject = Dynamsoft.DWT.GetWebTwain(this.containerId);
  }

  async acquireImage() {
    console.log(this.currentDevice);
    var self = this;

    if (this.DWObject?.SelectSourceByIndex(parseInt(this.currentDevice))) {
      this.DWObject?.AcquireImage();
    }
  }

  loadFile() {
    var onSuccess = function () {
      console.log('Loaded a file successfully!');
    };
    var onFailure = function (errorCode: number, errorString: string) {
      console.log(errorString);
    };
    this.DWObject!.IfShowFileDialog = true;
    // PDF Rasterizer Addon is used here to ensure PDF support
    this.DWObject?.Addon.PDF.SetResolution(200);
    this.DWObject?.Addon.PDF.SetConvertMode(
      Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL
    );
    this.DWObject?.LoadImageEx(
      '',
      Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
      onSuccess,
      onFailure
    );
  }

  playVideo() {
    // if (this.videoPlaying) return;
    if (this.DWObject) {
      this.DWObject.Addon.Camera.stop();
      this.videoPlaying = false;

      //start video
      let self = this;
      this.DWObject.Addon.Camera.selectSource(this.currentCamera).then(() => {
        self.DWObject?.Addon.Camera.play().then(() => {
          self.videoPlaying = true;
        });
      });

      // if (this.DWObject.Addon.Webcam.SelectSource(this.currentCamera)) {
      //   if (this.DWObject.Addon.Webcam.PlayVideo(this.DWObject, 10))
      //     self.videoPlaying = true;
      // }
    }
  }

  showEditor() {
    this.DWObject?.Viewer.createImageEditor().show();
    this.DWObject?.RegisterEvent('CloseImageEditorUI', () => {});
  }

  zoomIn() {
    this.DWObject!.Viewer.zoom += 5;
    console.log(this.DWObject?.Viewer.zoom);
  }
  zoomOut() {
    this.DWObject!.Viewer.zoom = 0.27;
    console.log(this.DWObject?.Viewer.zoom);
  }

  captureImage() {
    if (!this.DWObject) return;
    const capImage: () => void = () =>
      setTimeout((): void => {
        if (this.videoPlaying) {
          this.DWObject?.Addon.Camera.capture().then(() => {
            this.DWObject?.Addon.Camera.stop();
            this.videoPlaying = false;
          });
        } else {
          capImage();
        }
      }, 50);
  }

  testButton() {}
}
