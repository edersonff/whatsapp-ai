import { Injectable, Logger } from '@nestjs/common';
import { Axios } from 'axios';
import { Lang } from 'types/language/enum';
import { Category } from 'src/category/entities/category.entity';
import { UsersService } from 'src/users/users.service';
import { Video } from 'src/video/entities/video.entity';
import { VideoService } from 'src/video/video.service';
import {
  uniqueNamesGenerator,
  names,
  adjectives,
  countries,
  starWars,
} from 'unique-names-generator';
import { upload as uploadToYoutube } from 'youtube-videos-uploader';

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
      throw new Error('Cookie not found');
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

  constructor(
    private readonly videoService: VideoService,
    private readonly userService: UsersService,
  ) {}

  // @Cron('*/10 * * * *')
  async publishVideosCron() {
    const users = await this.userService.findAll({
      where: {
        videos: {
          status: 'ready',
        },
      },
      relations: {
        videos: true,
        socials: true,
      },
    });

    if (users.length === 0) {
      this.logger.debug('No users with ready videos', new Date());
      return;
    }

    for (const user of users) {
      const { videos, socials } = user;

      for (const video of videos) {
        const { output } = video;

        if (!output) {
          continue;
        }

        for (const social of socials) {
          const { token, type, username, password } = social;

          switch (type) {
            case 'youtube':
              await this.uploadToYoutube(video, { username, password });
              break;
            case 'meta':
              await this.uploadToFacebook(video, token);
              break;
            case 'instagram':
              await this.uploadToInstagram(video, token);
              break;
            case 'tiktok':
              await this.uploadToTiktok(video, token);
              break;
            case 'pinterest':
              // await this.uploadToPinterest(video, token);
              break;
          }
        }

        await this.videoService.update(video.id, {
          status: 'published',
        });

        this.logger.debug('Video published', new Date());
      }
    }

    this.logger.debug('All videos published', new Date());

    return;
  }

  private async uploadToYoutube(
    video: Video & { category: Category },
    credentials: { username: string; password: string },
  ) {
    const { username, password } = credentials;

    const options = {
      headless: false,
    };

    function coverterLanguage(lang: Lang) {
      switch (lang) {
        case 'en':
          return 'english';
        case 'es':
          return 'spanish';
        case 'de':
          return 'german';
        case 'fr':
          return 'french';
        case 'zh':
          return 'chinese';
        case 'ja':
          return 'japanese';
        case 'hi':
          return 'hindi';
        case 'ko':
          return 'korean';
        case 'pt':
          return 'portuguese';
        case 'it':
          return 'italian';
        case 'id':
          return 'indonesian';
        case 'nl':
          return 'dutch';
        case 'tr':
          return 'turkish';
        case 'fil':
          return 'filipino';
        case 'pl':
          return 'polish';
        case 'sv':
          return 'swedish';
        case 'bg':
          return 'bulgarian';
        case 'ro':
          return 'romanian';
        case 'ar':
          return 'arabic';
        case 'cs':
          return 'czech';
        case 'el':
          return 'greek';
        case 'fi':
          return 'finnish';
        case 'hr':
          return 'croatian';
        case 'hu':
          return 'hungarian';
        case 'ms':
          return 'malay';
        case 'no':
          return 'norwegian';
        case 'sk':
          return 'slovak';
        case 'da':
          return 'danish';
        case 'ta':
          return 'tamil';
        case 'uk':
          return 'ukrainian';
      }
    }

    const video1 = {
      path: video.link,
      title: video.name,
      thumbnail: video.image,
      tags: video.tags.split(','),
      playlist: video.category.name,
      skipProcessingWait: true,
      isAgeRestriction: false,
      isNotForKid: false,
      publishType: 'PUBLIC' as const,
      language: coverterLanguage(video.originalLanguage),
      description: video.description,
    };

    await uploadToYoutube(
      { email: username, pass: password },
      [video1],
      options,
    );
  }

  private async uploadToFacebook(video: Video, token: string) {
    const api = new Axios({
      baseURL: 'https://graph.facebook.com',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const data = {
      upload_phase: 'start',
      access_token: token,
    };

    const {
      data: { video_id, upload_url },
    } = await api.post('/v19.0/Your_page_id/video_reels', data);

    await api.post(upload_url, {
      headers: {
        Authorization: `OAuth ${token}`,
        file_url: video.link,
      },
    });

    let {
      data: { status },
    } = await api.get(`/v19.0/${video_id}`, {
      params: {
        fields: 'status',
        access_token: token,
      },
    });

    while (status.video_status === 'processing') {
      await wait(3000);
      status = await api.get(`/v19.0/${video_id}`, {
        params: {
          fields: 'status',
          access_token: token,
        },
      });
    }

    await api.post('/v19.0/page-id/video_reels', {
      access_token: token,
      video_id,
      upload_phase: 'finish',
      video_state: 'PUBLISHED',
      description: video.name,
    });
  }

  private async uploadToInstagram(video: Video, token: string) {
    const api = new Axios({
      baseURL: 'https://graph.facebook.com',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const {
      data: { id: ig_user_id },
    } = await api.get('/v19.0/me', {
      params: {
        fields: 'id',
        access_token: token,
      },
    });

    const {
      data: { id: ig_container_id },
    } = await api.post(
      `/v19.0/${ig_user_id}/media`,
      {
        media_type: 'REELS',
        video_url: video.link,
        caption: video.name,
        share_to_feed: false,
        access_token: token,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      },
    );

    await api.post(
      `/v19.0/${ig_user_id}/media_publish`,
      {
        creation_id: ig_container_id,
        access_token: token,
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      },
    );
  }

  private async uploadToTiktok(video: Video, token: string) {
    const api = new Axios({
      baseURL: 'https://open.tiktokapis.com',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    });

    const data = {
      post_info: {
        title: video.name,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: video.link,
      },
    };

    await api.post('/v2/post/publish/video/init/', data);
  }

  // private async uploadToPinterest(video: Video, token: string) {
  //   const formData = new FormData();

  //   formData.append('media_type', 'video');
  // }

  // @Cron('*/30 * * * *')
  async renderVideosCron() {
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
        const { link, name, originalLanguage, targetLanguage } = video;

        await trydub.postProject({
          name: name || 'Untitled' + Math.random(),
          sourceUrl: link,
          sourceLanguage: originalLanguage,
          targetLanguage: targetLanguage,
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
