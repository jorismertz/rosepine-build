import fs from "node:fs";
import path from "node:path";
import {
	roleKeys,
	roleColors,
	variants,
	variantKeys,
} from "@rose-pine/palette";
import { type Config } from "../config.js";
import { formatColor } from "./format-color.js";

function generateVariant(
	variant: (typeof variants)[keyof typeof variants],
	template: string,
	filename: string,
	config: Config,
) {
	const description =
		"All natural pine, faux fur and a bit of soho vibes for the classy minimalist";
	const type = variant.name === "dawn" ? "light" : "dark";

	let result = template;

	for (const role of roleKeys) {
		//@ts-ignore
		const currentColor = roleColors[role][variant.key];

		if ("alpha" in currentColor) {
			// Replace alpha colors
			result = result.replaceAll(
				`${config.prefix}${role}Alpha`,
				formatColor(currentColor.alpha, config.format, config.stripSpaces),
			);
		}

		// Replace colors
		result = result.replaceAll(
			`${config.prefix}${role}`,
			formatColor(currentColor, config.format, config.stripSpaces),
		);
	}

	// Replace built-in values
	result = result.replaceAll(`${config.prefix}id`, variant.id);
	result = result.replaceAll(`${config.prefix}name`, variant.name);
	result = result.replaceAll(`${config.prefix}description`, description);
	result = result.replaceAll(`${config.prefix}type`, type);

	// Replace custom values
	result = result.replaceAll(
		/\$\((.*?)\|(.*?)\|(.*?)\)/gm,
		`$${variantKeys.indexOf(variant.key as any) + 1}`,
	);

	console.log("Output", config.output + "/" + filename);

	fs.mkdirSync(config.output, { recursive: true });
	fs.writeFileSync(path.join(config.output, filename), result, "utf8");
}

export const generateVariants = (config: Config) => {
	const isDir = fs.lstatSync(config.template).isDirectory();
	console.log("isDir", isDir);
	const extension = path.extname(config.template);

	for (const variant of variantKeys) {
		const currentVariant = variants[variant];
		if (isDir) {
			fs.mkdirSync(config.output + "/" + currentVariant.key, {
				recursive: true,
			});
			for (const file of fs.readdirSync(config.template)) {
				const template = fs.readFileSync(
					path.join(config.template, file),
					"utf8",
				);
				generateVariant(
					currentVariant,
					template,
					`${currentVariant.key}/${file}`,
					config,
				);
			}
		} else {
			const template = fs.readFileSync(config.template, "utf8").toString();
			generateVariant(
				currentVariant,
				template,
				`${currentVariant.id}${extension}`,
				config,
			);
		}
		// const currentVariant = variants[variant];
		// const description =
		// 	"All natural pine, faux fur and a bit of soho vibes for the classy minimalist";
		// const type = variant === "dawn" ? "light" : "dark";
		//
		// let result = template;
		//
		// for (const role of roleKeys) {
		// 	const currentColor = roleColors[role][variant];
		//
		// 	if ("alpha" in currentColor) {
		// 		// Replace alpha colors
		// 		result = result.replaceAll(
		// 			`${config.prefix}${role}Alpha`,
		// 			formatColor(currentColor.alpha, config.format, config.stripSpaces),
		// 		);
		// 	}
		//
		// 	// Replace colors
		// 	result = result.replaceAll(
		// 		`${config.prefix}${role}`,
		// 		formatColor(currentColor, config.format, config.stripSpaces),
		// 	);
		// }
		//
		// // Replace built-in values
		// result = result.replaceAll(`${config.prefix}id`, currentVariant.id);
		// result = result.replaceAll(`${config.prefix}name`, currentVariant.name);
		// result = result.replaceAll(`${config.prefix}description`, description);
		// result = result.replaceAll(`${config.prefix}type`, type);
		//
		// // Replace custom values
		// result = result.replaceAll(
		// 	/\$\((.*?)\|(.*?)\|(.*?)\)/gm,
		// 	`$${variantKeys.indexOf(variant) + 1}`,
		// );
		//
		// fs.mkdirSync(config.output, { recursive: true });
		// fs.writeFileSync(
		// 	`${config.output}/${currentVariant.id}${extension}`,
		// 	result,
		// 	"utf8",
		// );
	}
};
