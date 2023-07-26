import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { DataTypeService } from '../data.type.service'
import sharp from 'sharp'
import path from 'path'

@Injectable()
export class ToolService {
  constructor(private readonly dataTypeService: DataTypeService) {}

  async urlResTxt2Img(url: string) {
    const response = await axios.get(decodeURIComponent(url))

    const buf = await sharp({
      text: {
        text: `<span color="red" bgalpha="1" font_size="12.5pt">${response.data.data}</span>`,
        rgba: true,
        width: 100,
        height: 15,
        fontfile: path.join(__dirname, './../config/OpenSans-Regular.ttf'),
      },
    })
      .ensureAlpha(0)
      .png()
      .toBuffer()

    const buf2 = await sharp({
      create: {
        width: 80,
        height: 34,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: buf,
        },
      ])
      .ensureAlpha(0)
      .png()
      .toBuffer()

    return buf2
  }
}
