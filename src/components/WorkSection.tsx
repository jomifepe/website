interface WorkExperience {
	company: string;
	role: string;
	startDate: string;
	endDate?: string;
	logo?: string;
	url?: string;
}

interface WorkSectionProps {
	experiences: WorkExperience[];
}

export default function WorkSection({ experiences }: WorkSectionProps) {
	return (
		<section className="mt-16">
			<h2 className="text-white text-sm font-medium mb-8 tracking-wider">work</h2>
			<div className="flex flex-col gap-6">
				{experiences.map((exp) => {
					const content = (
						<>
							{exp.logo && (
								<img
									src={exp.logo}
									alt={`${exp.company} logo`}
									className="w-12 h-12 rounded object-contain shrink-0"
								/>
							)}
							<div className="flex-1">
								<div className="flex items-baseline gap-2 mb-1">
									<span className="text-white font-medium">{exp.company}</span>
									<span className="text-white/60">·</span>
									<span className="text-white/80">{exp.role}</span>
								</div>
								<div className="text-white/60 text-sm">
									{exp.startDate} – {exp.endDate || "current"}
								</div>
							</div>
						</>
					);

					if (exp.url) {
						return (
							<a
								key={exp.company + exp.role}
								href={exp.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-start gap-4 p-3 -m-3 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
							>
								{content}
							</a>
						);
					}

					return (
						<div key={exp.company + exp.role} className="flex items-start gap-4">
							{content}
						</div>
					);
				})}
			</div>
		</section>
	);
}
