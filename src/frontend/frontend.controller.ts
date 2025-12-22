import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class FrontendController {
  @Get()
  @Render('frontend/index')
  index() {
    const menu = [
      {
        title: 'SERVICE',
        color: '#478bfb',
        icon: '/frontend/img/icon/service.svg',
      },
      {
        title: 'Corporate Website',
        icon: '/frontend/img/icon/site.svg',
        context: [
          {
            title: 'One-Stop Service',
          },
          {
            title: 'Fast Build',
          },
          {
            title: 'Template Choice',
          },
          {
            title: 'Free Maintenance',
          },
        ],
      },
      {
        title: 'Corporate Portal',
        icon: '/frontend/img/icon/site2.svg',
        context: [
          {
            title: 'Corporate News',
          },
          {
            title: 'Showcase',
          },
          {
            title: 'Self-maintained',
          },
          {
            title: 'Scalable',
          },
        ],
      },
      {
        title: 'Customizable Dev',
        icon: '/frontend/img/icon/site2.svg',
        context: [
          {
            title: 'E-commerce',
          },
          {
            title: 'Online Booking',
          },
          {
            title: 'Online Ticketing',
          },
          {
            title: 'Mobile App',
          },
        ],
      },
      {
        title: 'Systems Dve',
        icon: '/frontend/img/icon/site2.svg',
        context: [
          {
            title: 'Warehouse Mgmt',
          },
          {
            title: 'Courier Mgmt',
          },
          {
            title: 'Order Mgmt',
          },
          {
            title: 'Learning Data Mgmt',
          },
        ],
      },
    ];
    return {
      title: 'Home',
      menu,
    };
  }
}
