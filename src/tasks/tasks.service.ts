import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Axios } from 'axios';
import { VideoService } from 'src/video/video.service';
import {
  uniqueNamesGenerator,
  names,
  adjectives,
  countries,
  starWars,
} from 'unique-names-generator';

const TempMail = require('node-temp-mail');

const axios = new Axios({
  baseURL: 'https://app.trydub.com',
  headers: {
    'Content-Type': 'multipart/form-data',
    Accept: 'text/x-component',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
    'Cache-Control': 'no-cache',
    'Next-Router-State-Tree':
      '%5B%22%22%2C%7B%22children%22%3A%5B%22(app)%22%2C%7B%22children%22%3A%5B%22register%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
    Origin: 'https://app.trydub.com',
    Pragma: 'no-cache',
    Referer: 'https://app.trydub.com/register',
    'Sec-Ch-Ua':
      '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  },
});

function getPassword() {
  const length = 8;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class Trydub {
  name: string = '';

  email: string = '';
  password: string = '';
  cookie: string = '';

  tempMail: typeof TempMail;

  constructor() {
    this.getUniqueName();
    this.getPassword();
  }

  getUniqueName = () => {
    this.name = uniqueNamesGenerator({
      dictionaries: [adjectives, names, countries, starWars],
      length: 2,
      separator: '-',
    });
  };

  getPassword = () => {
    this.password = getPassword();
  };

  getTempMail = async () => {
    const tempMail = new TempMail(this.name);

    const { address: email } = tempMail.getAddress();

    this.email = email;

    this.tempMail = tempMail;
  };

  register = async () => {
    const formData = new FormData();

    formData.append('1_email', this.email);
    formData.append('1_password', this.password);
    formData.append('0', '["$K1"]');

    const registerPost = axios.post('/register', formData, {
      headers: {
        'Next-Action': 'f848affe288a368678657e5ceee8cca4eaa9d869',
      },
    });

    await registerPost;
    await registerPost;
  };

  login = async () => {
    const formData = new FormData();

    formData.append('1_email', this.email);
    formData.append('1_password', this.password);
    formData.append('0', '["$K1"]');

    const data = await axios.post('/login', formData, {
      headers: {
        'Next-Action': 'c49e38ffaefa112e8b778a9d395d15345e7dc95b',
      },
    });

    const setCookie = data.headers['set-cookie'];

    if (!setCookie || typeof setCookie !== 'string') {
      throw new Error('Error on login');
    }

    this.cookie = setCookie;
  };

  waitForEmail = async () => {
    let email = await this.tempMail.waitForEmail();

    while (!email) {
      await wait(3000);
      email = await this.tempMail.waitForEmail();
    }

    return email;
  };

  confirmEmail = async (html: string) => {
    const confirmUrl = html
      .split('https://us-east-1.resend-clicks.com/CL0/')[1]
      .split('"')[0];

    await axios.get(confirmUrl, {
      headers: {
        Cookie: this.cookie,
      },
    });
  };

  postProject = async (data: {
    name?: string;
    sourceObject?: any;
    sourceUrl?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    mediaDuration?: number;
    includeBackground?: boolean;
    speakerNumber?: number;
  }) => {
    await axios.post('/api/project', data, {
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
    });
  };

  getProject = async () => {
    const { data } = await axios.get('/project', {
      headers: {
        Cookie: this.cookie,
      },
    });

    const decodedData = data.split('{"data":')[1].split('}]')[0];

    return JSON.parse(`"${decodedData}}]`) as any[];
  };

  createUrlProject = async (projectId: string) => {
    const { data } = await axios.post(
      '/api/createUrl',
      {
        key: projectId, //"cltwgrb8b000112c2zl30fwqk_pt.mp4"
        method: 'get',
      },
      {
        headers: {
          Cookie: this.cookie,
        },
      },
    );

    return data.url;
  };
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly videoService: VideoService) {}

  @Cron('*/30 * * * *')
  async handleCron() {
    const videos = await this.videoService.findAll({
      take: 5,
      where: {
        status: 'draft',
      },
    });

    if (videos.length === 0) {
      this.logger.debug('No videos to process', new Date());
      return;
    }

    try {
      const trydub = new Trydub();

      await trydub.getTempMail();

      await trydub.register();

      const email = await trydub.waitForEmail();

      const html = email[0].html;

      await trydub.confirmEmail(html);

      await trydub.login();

      for (const video of videos) {
        const { link, name } = video;

        await trydub.postProject({
          name: name || 'Untitled' + Math.random(),
          sourceUrl: link,
          sourceLanguage: 'en',
          targetLanguage: 'pt',
          mediaDuration: 0,
          includeBackground: true,
          speakerNumber: 0,
        });
      }

      let projects = (await trydub.getProject()).filter(
        (project) => project.status === 'completed',
      );

      while (projects.length < videos.length) {
        await wait(60000);
        projects = (await trydub.getProject()).filter(
          (project) => project.status === 'completed',
        );
      }

      for (const project of projects) {
        const url = await trydub.createUrlProject(project.id);

        await this.videoService.update(project.id, {
          output: url,
          status: 'ready',
        });
      }

      this.logger.debug(
        projects.join(', ') + ' projects output updated',
        new Date(),
      );
    } catch (e) {
      this.logger.error(e, new Date());
    }
  }
}
